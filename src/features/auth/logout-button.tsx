import { LogOutIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppAuth } from "@/app";

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
