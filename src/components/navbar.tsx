import Link from "next/link";
import { LoginButton } from "./login-button";

export function Navbar() {
  return (
    <header className="border-b border-foreground/5 flex items-center h-16 justify-between px-4">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-xl font-black tracking-tighter text-foreground">
          ironman<span className="text-red-500">.fm</span>
        </span>
      </Link>
      <LoginButton />
    </header>
  );
}
