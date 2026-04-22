import { ArrowLeftIcon } from "lucide-react";
import { FC, ReactNode } from "react";

import { AppLink } from "@/components/app-link";
import { SidebarHeader } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { SpotfiySidebarToggle } from "../spotify-shell/spotify-sidebar-toggle";

export type ArtistHeaderProps = { href: string; title: ReactNode };

export const ArtistHeader: FC<ArtistHeaderProps> = ({ href, title }) => (
  <SidebarHeader title={title}>
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
    <SpotfiySidebarToggle />
  </SidebarHeader>
);
