import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 mt-20">
      <h1 className="text-5xl font-extrabold text-purple-400">Welcome to Polymarket Clone</h1>
      <p className="text-gray-300 max-w-xl">
        Explore prediction markets, trade outcomes in real-time, and see live market prices. Powered by
        Next.js, Prisma, Redis, and SSE.
      </p>
      <Link
        href="/markets"
        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition"
      >
        Explore Markets
      </Link>
    </div>
  );
}
