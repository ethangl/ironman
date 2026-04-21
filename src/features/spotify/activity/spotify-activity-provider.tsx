import type { ReactNode } from "react";

import { useAppCapabilities } from "@/app";
import {
  SpotifyActivityUiContext,
  useSpotifyActivityUiState,
} from "./use-spotify-activity-ui";
import {
  SpotifyFavoriteArtistsContext,
  useSpotifyFavoriteArtistsState,
} from "./use-spotify-favorite-artists";
import {
  SpotifyPlaylistsContext,
  useSpotifyPlaylistsState,
} from "./use-spotify-playlists";
import {
  SpotifyRecentlyPlayedContext,
  useSpotifyRecentlyPlayedState,
} from "./use-spotify-recently-played";

export function SpotifyActivityProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { canBrowsePersonalSpotify } = useAppCapabilities();
  const ui = useSpotifyActivityUiState();
  const recentlyPlayed = useSpotifyRecentlyPlayedState({
    canBrowsePersonalSpotify,
  });
  const favoriteArtists = useSpotifyFavoriteArtistsState({
    canBrowsePersonalSpotify,
  });
  const playlists = useSpotifyPlaylistsState({
    canBrowsePersonalSpotify,
  });

  return (
    <SpotifyActivityUiContext.Provider value={ui}>
      <SpotifyRecentlyPlayedContext.Provider value={recentlyPlayed}>
        <SpotifyFavoriteArtistsContext.Provider value={favoriteArtists}>
          <SpotifyPlaylistsContext.Provider value={playlists}>
            {children}
          </SpotifyPlaylistsContext.Provider>
        </SpotifyFavoriteArtistsContext.Provider>
      </SpotifyRecentlyPlayedContext.Provider>
    </SpotifyActivityUiContext.Provider>
  );
}
