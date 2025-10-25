"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function AppBar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="flex space-x-4">
        <Link href="/">Home</Link>
        <Link href="/markets">Markets</Link>
      </div>

      <div>
        {status === "loading" ? (
          <span>Loading...</span>
        ) : session ? (
          <div className="flex items-center space-x-4">
            <span>Hi, {session.user?.name || session.user?.email}</span>
            <button
              onClick={() => signOut()}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn()}
            className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
