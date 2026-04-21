import { type ReactNode, useState } from "react";

import { useAppCapabilities } from "@/app";
import { SpotifyActivityContext } from "./use-spotify-activity";
import { useSpotifyFavoriteArtists } from "./use-spotify-favorite-artists";
import { useSpotifyPlaylists } from "./use-spotify-playlists";
import { useSpotifyRecentlyPlayed } from "./use-spotify-recently-played";

export function SpotifyActivityProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { canBrowsePersonalSpotify } = useAppCapabilities();
  const [isExpanded, setIsExpanded] = useState(true);
  const { appendRecentTrack, loading, recentTracks, refresh } =
    useSpotifyRecentlyPlayed({
      canBrowsePersonalSpotify,
    });
  const {
    favoriteArtists,
    favoriteArtistsLoading,
    loadFavoriteArtists,
  } = useSpotifyFavoriteArtists({
    canBrowsePersonalSpotify,
  });
  const {
    getPlaylistTracks,
    loadMorePlaylists,
    loadPlaylists,
    playlists,
    playlistsLoading,
    playlistsTotal,
  } = useSpotifyPlaylists({
    canBrowsePersonalSpotify,
  });

  return (
    <SpotifyActivityContext.Provider
      value={{
        isExpanded,
        recentTracks,
        playlists,
        playlistsTotal,
        favoriteArtists,
        favoriteArtistsLoading,
        loading,
        playlistsLoading,
        appendRecentTrack,
        loadFavoriteArtists,
        loadPlaylists,
        refresh,
        loadMorePlaylists,
        getPlaylistTracks,
        setIsExpanded,
      }}
    >
      {children}
    </SpotifyActivityContext.Provider>
  );
}
