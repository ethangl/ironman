"use client";

import { LogOutIcon } from "lucide-react";

import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "./ui/button";

export function LogoutButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <Button variant="ghost" size="icon-sm" onClick={() => signOut()}>
        <LogOutIcon />
      </Button>
    );
  }

  return null;
}
