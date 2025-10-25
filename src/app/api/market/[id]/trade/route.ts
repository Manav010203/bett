import { prisma } from "@/app/lib/db";
import redis from "@/app/lib/redis";
import { NextRequest, NextResponse } from "next/server";


// Helper: LMSR cost function
function costFunction(q: number[], b: number) {
  return b * Math.log(q.reduce((sum, qi) => sum + Math.exp(qi / b), 0));
}

// Helper: Compute LMSR prices
function computePrices(q: number[], b: number) {
  const exp = q.map((qi) => Math.exp(qi / b));
  const total = exp.reduce((a, b) => a + b, 0);
  return exp.map((val) => val / total);
}
//redis for pub sub
const publisher = redis.duplicate();


// POST /api/markets/[id]/trade
export async function POST(req: NextRequest, { params }: { params:Promise<{ id: string }> }) {
  try {
    if(!publisher.isOpen) await publisher.connect();
    const { outcomeId, amount, type } = await req.json();

    if (!outcomeId || !amount || amount <= 0)
      return NextResponse.json({ error: "Invalid trade input" }, { status: 400 });
    const id = (await params).id;
    const market = await prisma.market.findUnique({
      where: { id: id },
      include: { outcomes: true },
    });

    if (!market) return NextResponse.json({ error: "Market not found" }, { status: 404 });
    if (market.status !== "open")
      return NextResponse.json({ error: "Market is not open for trading" }, { status: 400 });

    const b = market.liquidityParam;
    const q = market.outcomes.map((o) => o.quantity);
    const outcomeIndex = market.outcomes.findIndex((o) => o.id === outcomeId);

    if (outcomeIndex === -1)
      return NextResponse.json({ error: "Outcome not found" }, { status: 404 });

    // --- LMSR cost calculation ---
    const oldCost = costFunction(q, b);

    // Adjust quantities
    if (type === "buy") {
      q[outcomeIndex] += amount;
    } else if (type === "sell") {
      q[outcomeIndex] -= amount;
      if (q[outcomeIndex] < 0) return NextResponse.json({ error: "Invalid sell amount" }, { status: 400 });
    } else {
      return NextResponse.json({ error: "Invalid trade type" }, { status: 400 });
    }

    const newCost = costFunction(q, b);
    const costPaid = newCost - oldCost; // Total cost difference

    // --- Update database ---
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < market.outcomes.length; i++) {
        await tx.outcome.update({
          where: { id: market.outcomes[i].id },
          data: { quantity: q[i] },
        });
      }

      // (Optional) Save trade record for later analysis
      await tx.trade.create({
        data: {
          marketId: market.id,
          outcomeId,
          amount,
          type,
          cost: costPaid,
        },
      });
    });

    const prices = computePrices(q, b);
    


    const response = {
      marketId: market.id,
      prices: market.outcomes.map((o, i) => ({
        outcome: o.label,
        price: prices[i],
      })),
      costPaid,
    };


    await publisher.publish(`market:update:${market.id}`, JSON.stringify( response));
    console.log(`Published update for market ${market.id}`);

    await redis.del("market:all");
    await redis.del(`market:${market.id}`);

    return NextResponse.json(response);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
