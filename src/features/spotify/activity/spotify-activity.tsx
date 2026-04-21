import { RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSpotifyActivity } from "@/features/spotify/activity";
import { Tracks } from "@/features/spotify/activity/tracks";
import { Artists } from "./artists";
import { Playlists } from "./playlists";

export function SpotifyActivity() {
  const {
    favoriteArtists,
    favoriteArtistsLoading,
    playlists,
    playlistsLoading,
    recentTracks,
    loadFavoriteArtists,
    loadPlaylists,
  } = useSpotifyActivity();

  const hasPlaylists = playlists.length > 0;
  const hasFavoriteArtists = favoriteArtists.length > 0;

  return (
    <>
      <Tracks
        title="Recent Tracks"
        tracks={recentTracks.map(({ track }) => track)}
      />
      <Playlists
        title="Your Playlists"
        playlists={playlists}
        action={
          <Button
            variant="ghost"
            size="icon"
            disabled={playlistsLoading}
            onClick={() => void loadPlaylists(hasPlaylists)}
          >
            <RefreshCwIcon
              className={playlistsLoading ? "animate-spin" : undefined}
            />
          </Button>
        }
      />
      <Artists
        title="Your Favorite Artists"
        artists={favoriteArtists}
        action={
          <Button
            variant="ghost"
            size="icon"
            disabled={favoriteArtistsLoading}
            onClick={() => void loadFavoriteArtists(hasFavoriteArtists)}
          >
            <RefreshCwIcon
              className={favoriteArtistsLoading ? "animate-spin" : undefined}
            />
          </Button>
        }
      />
    </>
  );
}
