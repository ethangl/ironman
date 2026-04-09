import { LogOutIcon } from "lucide-react";

import { useAppAuth } from "@/runtime/app-runtime";
import { Button } from "./ui/button";

export function LogoutButton() {
  const { session, signOut } = useAppAuth();

  if (session) {
    return (
      <Button variant="ghost" size="icon-sm" onClick={() => signOut()}>
        <LogOutIcon />
      </Button>
    );
  }

  return null;
}
