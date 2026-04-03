"use client";

import { LoginButton } from "./login-button";

export function Navbar() {
  return (
    <header className="border-b border-white/5">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <a href="/" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tighter text-white">
            ironman<span className="text-red-500">.fm</span>
          </span>
        </a>
        <LoginButton />
      </div>
    </header>
  );
}
