import { Outlet } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarToggle,
} from "@/components/sidebar";
import { SearchInput, SearchResults } from "@/features/spotify-search";
import { SpotifyFooter } from "@/features/spotify-shell";
import { LibraryIcon, PanelLeftCloseIcon } from "lucide-react";

export function Spotify() {
  return (
    <Sidebar style={{ "--section-color": "var(--color-emerald-400)" }}>
      <SidebarHeader>
        <SearchInput />
        <span />
        <SidebarToggle
          collapseIcon={<PanelLeftCloseIcon />}
          expandIcon={<LibraryIcon />}
        />
      </SidebarHeader>
      <SidebarContent>
        <SearchResults />
        <Outlet />
      </SidebarContent>
      <SpotifyFooter />
    </Sidebar>
  );
}
