import { LoginButton } from "@/features/auth";

export function PublicHomeRoute() {
  return (
    <div className="flex h-dvh items-center justify-center w-dvw">
      <LoginButton />
    </div>
  );
}
