"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Outcome {
  id: string;
  label: string;
  quantity: number;
}

interface Market {
  id: string;
  title: string;
  description: string;
  outcomes: Outcome[];
}

export default function MarketsDashboard() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Fetch markets
  useEffect(() => {
    fetch("/api/markets")
      .then((res) => res.json())
      .then((data) => setMarkets(Array.isArray(data) ? data : data.resp || []))
      .catch(console.error);
  }, []);

  const handleCreate = async () => {
    if (!title) return alert("Title is required");

    const res = await fetch("/api/markets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        outcomes: ["Yes", "No"], // only strings
      }),
    });

    const data = await res.json();
    if (data.message) alert(data.message);

    if (data.id || data.market) {
      const newMarket = data.market || data;
      setMarkets((prev) => [newMarket, ...prev]);
    }

    setShowModal(false);
    setTitle("");
    setDescription("");
  };

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-purple-400">Markets</h1>
        <button
          className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500 transition"
          onClick={() => setShowModal(true)}
        >
          + Create Market
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96 space-y-4">
            <h2 className="text-xl font-semibold text-white">Create Market</h2>
            <input
              type="text"
              placeholder="Market Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-500 transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-500 transition"
                onClick={handleCreate}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Market Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {markets.map((market) => {
          const outcomes = market.outcomes || [];
          const totalQuantity = outcomes.reduce((sum, o) => sum + o.quantity, 0);
          const prices = outcomes.map((o) =>
            totalQuantity > 0 ? o.quantity / totalQuantity : 0
          );

          return (
            <Link
              key={market.id}
              href={`/markets/${market.id}`}
              className="p-5 bg-gray-800 rounded-lg border border-gray-700 hover:shadow-lg transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">{market.title}</h2>
                <p className="text-gray-400 text-sm line-clamp-2">{market.description}</p>
              </div>

              <div className="mt-4 flex gap-2 flex-wrap">
                {outcomes.slice(0, 2).map((o, i) => (
                  <span
                    key={o.id}
                    className="px-2 py-1 bg-gray-700 rounded text-sm text-gray-200"
                  >
                    {o.label}: {(prices[i] * 100).toFixed(2)}%
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
