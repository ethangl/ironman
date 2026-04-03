"use client";

import { LoginButton } from "./login-button";
import { useSession } from "@/lib/auth-client";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-white/5">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tighter text-white">
              ironman<span className="text-red-500">.fm</span>
            </span>
          </a>
          {session && (
            <nav className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="text-sm text-zinc-400 hover:text-white transition"
              >
                Dashboard
              </a>
              <a
                href="/profile"
                className="text-sm text-zinc-400 hover:text-white transition"
              >
                Profile
              </a>
            </nav>
          )}
        </div>
        <LoginButton />
      </div>
    </header>
  );
}
