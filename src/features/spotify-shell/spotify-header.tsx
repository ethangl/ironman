import { ArrowLeftIcon } from "lucide-react";
import { FC } from "react";

import { AppLink } from "@/components/app-link";
import { SidebarHeader, SidebarHeaderProps } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { SpotifySearchButton } from "../spotify-search/spotify-search-button";
import { SpotfiySidebarToggle } from "./spotify-sidebar-toggle";

export type SpotifyHeaderProps = SidebarHeaderProps & { href?: string };

export const SpotifyHeader: FC<SpotifyHeaderProps> = ({ href, ...props }) => (
  <SidebarHeader {...props}>
    {href ? (
      <Button
        variant="ghost"
        size="icon-sm"
        nativeButton={false}
        render={
          <AppLink href={href}>
            <ArrowLeftIcon />
          </AppLink>
        }
      />
    ) : (
      <SpotifySearchButton />
    )}
    <SpotfiySidebarToggle />
  </SidebarHeader>
);
