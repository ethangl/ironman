import { RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Artists } from "@/features/artist";
import {
  useSpotifyFavoriteArtists,
  useSpotifyPlaylists,
  useSpotifyRecentlyPlayed,
} from "@/features/spotify-library";
import { Playlists } from "@/features/spotify-playlists";
import { Tracks } from "@/features/spotify-tracks";

export function SpotifyActivity() {
  const { recentTracks } = useSpotifyRecentlyPlayed();
  const { favoriteArtists, favoriteArtistsLoading, loadFavoriteArtists } =
    useSpotifyFavoriteArtists();
  const { playlists, playlistsLoading, loadPlaylists } = useSpotifyPlaylists();

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
            variant="overlay"
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
            variant="overlay"
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
