/* eslint-disable */

"use client";

import { useEffect, useState } from "react";

interface Outcome {
  id: string;
  label: string;
  quantity?: number;
}

interface MarketLiveProps {
  marketId: string;
  initialOutcomes: Outcome[];
}

export default function MarketLive({ marketId, initialOutcomes }: MarketLiveProps) {
  const [outcomes, setOutcomes] = useState<Outcome[]>(initialOutcomes || []);
  const [amount, setAmount] = useState<number>(1);

  // Connect to SSE for live updates
  useEffect(() => {
    const es = new EventSource(`/api/markets/${marketId}/stream`);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data); // { prices: [...] }
        setOutcomes(
          data.prices.map((p: any, i: number) => ({
            id: initialOutcomes[i]?.id || `o-${i}`,
            label: p.outcome,
            quantity: p.price, // 0-1
          }))
        );
      } catch (err) {
        console.error("SSE parsing error:", err);
      }
    };

    es.onerror = (err) => {
      console.error("SSE error:", err);
      es.close();
    };

    return () => es.close();
  }, [marketId, initialOutcomes]);

  const handleTrade = async (outcomeId: string, type: "buy" | "sell") => {
    try {
      const res = await fetch(`/api/markets/${marketId}/trade`, {
        method: "POST",
        body: JSON.stringify({ outcomeId, amount, type }),
      });
      const data = await res.json();
      if (data.error) alert(data.error);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <label className="text-gray-300">Amount:</label>
        <input
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-24 px-2 py-1 rounded bg-gray-700 border border-gray-600 text-white"
        />
      </div>

      {outcomes.map((o) => (
        <div
          key={o.id}
          className="flex justify-between items-center p-3 bg-gray-800 rounded-lg border border-gray-700"
        >
          <span className="font-medium text-white">{o.label}</span>
          <span className="text-green-400">{(o.quantity!*100).toFixed(2)}%</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleTrade(o.id, "buy")}
              className="px-3 py-1 bg-green-600 rounded hover:bg-green-500 transition"
            >
              Buy
            </button>
            <button
              onClick={() => handleTrade(o.id, "sell")}
              className="px-3 py-1 bg-red-600 rounded hover:bg-red-500 transition"
            >
              Sell
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
