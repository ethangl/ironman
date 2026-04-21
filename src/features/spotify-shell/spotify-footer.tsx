import { useAppAuth } from "@/app/app-runtime";
import { useAuthenticatedSession } from "@/app/require-authenticated-session";
import { Avatar } from "@/components/avatar";
import { SidebarFooter } from "@/components/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClearSpotifyCacheButton } from "@/features/spotify-shell/clear-spotify-cache-button";
import { LogOutIcon } from "lucide-react";

export function SpotifyFooter() {
  const session = useAuthenticatedSession();
  const { signOut } = useAppAuth();

  return (
    <SidebarFooter>
      <ClearSpotifyCacheButton />
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar
            id={session.user.id}
            image={session.user.image || null}
            name={session.user.name}
            sizeClassName="size-8 text-xl"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOutIcon /> Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
  );
}
