import { RefreshCw } from "lucide-react";

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
    <div className="m-3 space-y-3">
      <Tracks
        title="Recent Tracks"
        tracks={recentTracks.map(({ track }) => track)}
        display="thumbnails"
      />
      <Playlists
        title="Your Playlists"
        display="thumbnails"
        playlists={playlists}
        action={
          <Button
            variant="ghost"
            size="xs"
            disabled={playlistsLoading}
            onClick={() => void loadPlaylists(hasPlaylists)}
          >
            <RefreshCw
              className={playlistsLoading ? "animate-spin" : undefined}
            />
            {hasPlaylists ? "Refresh" : "Load"}
          </Button>
        }
      />
      <Artists
        title="Your Favorite Artists"
        artists={favoriteArtists}
        action={
          <Button
            variant="ghost"
            size="xs"
            disabled={favoriteArtistsLoading}
            onClick={() => void loadFavoriteArtists(hasFavoriteArtists)}
          >
            <RefreshCw
              className={favoriteArtistsLoading ? "animate-spin" : undefined}
            />
            {hasFavoriteArtists ? "Refresh" : "Load"}
          </Button>
        }
      />
    </div>
  );
}
