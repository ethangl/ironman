import { useAppAuth, useAppCapabilities } from "@/app/app-runtime";
import { ClearSpotifyCacheButton } from "@/app/clear-spotify-cache-button";
import { Avatar } from "@/components/avatar";
import { Section } from "@/components/section";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOutIcon } from "lucide-react";

export function SpotifyFooter() {
  const { session, signOut } = useAppAuth();
  const { canBrowsePersonalSpotify } = useAppCapabilities();

  if (!session || !canBrowsePersonalSpotify) {
    return null;
  }

  if (canBrowsePersonalSpotify) {
    return (
      <Section className="flex flex-none gap-2 h-14 items-center justify-between px-4">
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
      </Section>
    );
  }
}
