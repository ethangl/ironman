import type { ReactNode } from "react";

import {
  SpotifyActivityUiContext,
  useSpotifyActivityUiState,
} from "./use-spotify-activity-ui";
import {
  SpotifyFavoriteArtistsContext,
  useSpotifyFavoriteArtistsState,
  SpotifyPlaylistsContext,
  useSpotifyPlaylistsState,
  SpotifyRecentlyPlayedContext,
  useSpotifyRecentlyPlayedState,
} from "../spotify-library";

export function SpotifyActivityProvider({
  children,
}: {
  children: ReactNode;
}) {
  const ui = useSpotifyActivityUiState();
  const recentlyPlayed = useSpotifyRecentlyPlayedState();
  const favoriteArtists = useSpotifyFavoriteArtistsState();
  const playlists = useSpotifyPlaylistsState();

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
