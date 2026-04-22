import type { ReactNode } from "react";

import {
  SpotifyFavoriteArtistsContext,
  SpotifyPlaylistsContext,
  SpotifyRecentlyPlayedContext,
  useSpotifyFavoriteArtistsState,
  useSpotifyPlaylistsState,
  useSpotifyRecentlyPlayedState,
} from "../spotify-library";

export function SpotifyActivityProvider({ children }: { children: ReactNode }) {
  const recentlyPlayed = useSpotifyRecentlyPlayedState();
  const favoriteArtists = useSpotifyFavoriteArtistsState();
  const playlists = useSpotifyPlaylistsState();

  return (
    <SpotifyRecentlyPlayedContext.Provider value={recentlyPlayed}>
      <SpotifyFavoriteArtistsContext.Provider value={favoriteArtists}>
        <SpotifyPlaylistsContext.Provider value={playlists}>
          {children}
        </SpotifyPlaylistsContext.Provider>
      </SpotifyFavoriteArtistsContext.Provider>
    </SpotifyRecentlyPlayedContext.Provider>
  );
}
