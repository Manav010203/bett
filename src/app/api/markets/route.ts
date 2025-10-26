import { prisma } from "@/app/lib/db";
import redis from "@/app/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const cacheKey = "market:all";

    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("cached memory has been hit✅");
      return NextResponse.json(JSON.parse(cached));
    }

    console.log("Cache miss ❌ — fetching from Postgres...");

    const resp = await prisma.market.findMany({
      include: { outcomes: true },
      orderBy: { createdAt: "desc" },
    });

    if (!resp) {
      return NextResponse.json({ message: "unable to fetch" }, { status: 500 });
    }

    await redis.set(cacheKey, JSON.stringify(resp), { EX: 40 });

    return NextResponse.json({ resp }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

type reqbody = {
  title: string;
  description: string;
  outcomes: string[];
  liquidityParam?: number;
};

export async function POST(req: NextRequest) {
  try {
    const body: reqbody = await req.json();

    if (!body.title || !body.outcomes?.length) {
      return NextResponse.json({ message: "Title and outcomes are required" }, { status: 400 });
    }

    const resp = await prisma.market.create({
      data: {
        title: body.title,
        description: body.description,
        liquidityParam: body.liquidityParam || 10,
        outcomes: {
          create: body.outcomes.map((label) => ({ label })),
        },
        status: "open",
      },
      include: { outcomes: true },
    });

    await redis.del("market:all");
    await redis.del(`market:${resp.id}`);

    return NextResponse.json(resp, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Something went wrong on our side" }, { status: 500 });
  }
}
