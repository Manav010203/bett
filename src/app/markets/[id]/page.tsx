import MarketLive from "./MarketLive";

export default async function MarketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: marketId } = await params;

  if (!marketId) throw new Error("Market ID missing");

  const res = await fetch(`http://localhost:3000/api/markets/${marketId}`);
  const data = await res.json();

  // unwrap if API returns { market: { ... } }
  const market = data.market || data;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-purple-400">{market.title}</h1>
      <p className="text-gray-300">{market.description}</p>

      <MarketLive marketId={marketId} initialOutcomes={market.outcomes} />
    </div>
  );
}
