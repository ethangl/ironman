import { Outlet } from "react-router-dom";

import { SearchProvider, SearchResults } from "@/features/search";
import { SpotifyActivityProvider } from "@/features/spotify/activity";
import { WebPlayerProvider } from "@/features/spotify/player";
import { AuthedNavbar } from "./authed-navbar";

export function AuthedLayout() {
  return (
    <SpotifyActivityProvider>
      <WebPlayerProvider>
        <SearchProvider>
          <AuthedNavbar />
          <SearchResults />
          <Outlet />
        </SearchProvider>
      </WebPlayerProvider>
    </SpotifyActivityProvider>
  );
}
