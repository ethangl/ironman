import { AppLink } from "@/components/app-link";
import { LoginButton } from "@/features/auth";

export function PublicNavbar() {
  return (
    <header className="backdrop-blur-lg backdrop-brightness-25 bottom-auto fixed flex inset-0 items-center h-16 justify-between px-4 top-0 z-20">
      <AppLink href="/" className="flex items-center gap-2">
        <span className="text-xl font-black tracking-tighter text-foreground">
          rooms<span className="text-red-500">.fm</span>
        </span>
      </AppLink>
      <LoginButton />
    </header>
  );
}
