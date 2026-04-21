import { LogOutIcon } from "lucide-react";

import { useAppAuth } from "@/app/app-runtime";
import { Button } from "@/components/ui/button";

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
