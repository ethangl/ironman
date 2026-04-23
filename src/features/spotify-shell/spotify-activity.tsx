import { LibraryIcon, PanelLeftCloseIcon, RefreshCwIcon } from "lucide-react";

import {
  SidebarContent,
  SidebarHeader,
  SidebarToggle,
} from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Artists } from "@/features/artist";
import {
  useSpotifyFavoriteArtists,
  useSpotifyPlaylists,
  useSpotifyRecentlyPlayed,
} from "@/features/spotify-library";
import { Playlists } from "@/features/spotify-playlists";
import { Tracks } from "@/features/spotify-tracks";
import { SpotifySearch } from "../spotify-search/spotify-search";

export function SpotifyActivity() {
  const {
    loadMoreRecentTracks,
    loading: recentTracksLoading,
    recentTracks,
    recentTracksHasMore,
    recentTracksLoadingMore,
  } = useSpotifyRecentlyPlayed();
  const {
    favoriteArtists,
    favoriteArtistsHasMore,
    favoriteArtistsLoading,
    favoriteArtistsLoadingMore,
    loadFavoriteArtists,
    loadMoreFavoriteArtists,
  } = useSpotifyFavoriteArtists();
  const {
    loadMorePlaylists,
    playlists,
    playlistsHasMore,
    playlistsLoading,
    playlistsLoadingMore,
    loadPlaylists,
  } = useSpotifyPlaylists();

  const hasPlaylists = playlists.length > 0;
  const hasFavoriteArtists = favoriteArtists.length > 0;

  return (
    <>
      <SidebarHeader title="Spotify">
        <SpotifySearch />
        <SidebarToggle
          collapseIcon={<PanelLeftCloseIcon />}
          expandIcon={<LibraryIcon />}
        />
      </SidebarHeader>
      <SidebarContent>
        <Tracks
          title="Recent Tracks"
          getTrackKey={(_track, index) => {
            const recentTrack = recentTracks[index];
            return recentTrack
              ? `${recentTrack.track.id}:${recentTrack.playedAt}`
              : index;
          }}
          tracks={recentTracks.map(({ track }) => track)}
          paginate={
            recentTracksHasMore ? (
              <Button
                variant="secondary"
                size="sm"
                disabled={recentTracksLoading || recentTracksLoadingMore}
                onClick={() => void loadMoreRecentTracks()}
                className="w-full rounded-2xl"
              >
                {recentTracksLoadingMore ? <Spinner /> : "Load more Tracks"}
              </Button>
            ) : null
          }
        />
        <Playlists
          title="Your Playlists"
          playlists={playlists}
          action={
            <Button
              variant="overlay"
              size="icon"
              disabled={playlistsLoading || playlistsLoadingMore}
              onClick={() => void loadPlaylists(hasPlaylists)}
            >
              <RefreshCwIcon
                className={playlistsLoading ? "animate-spin" : undefined}
              />
            </Button>
          }
          paginate={
            playlistsHasMore ? (
              <Button
                variant="secondary"
                size="sm"
                disabled={playlistsLoading || playlistsLoadingMore}
                onClick={() => void loadMorePlaylists()}
                className="w-full rounded-2xl"
              >
                {playlistsLoadingMore ? <Spinner /> : "Load more Playlists"}
              </Button>
            ) : null
          }
        />
        <Artists
          title="Your Favorite Artists"
          artists={favoriteArtists}
          action={
            <Button
              variant="overlay"
              size="icon"
              disabled={favoriteArtistsLoading || favoriteArtistsLoadingMore}
              onClick={() => void loadFavoriteArtists(hasFavoriteArtists)}
            >
              <RefreshCwIcon
                className={favoriteArtistsLoading ? "animate-spin" : undefined}
              />
            </Button>
          }
          paginate={
            favoriteArtistsHasMore ? (
              <Button
                variant="secondary"
                size="sm"
                disabled={favoriteArtistsLoading || favoriteArtistsLoadingMore}
                onClick={() => void loadMoreFavoriteArtists()}
                className="w-full rounded-2xl"
              >
                {favoriteArtistsLoadingMore ? (
                  <Spinner />
                ) : (
                  "Load more Favorite Artists"
                )}
              </Button>
            ) : null
          }
        />
      </SidebarContent>
    </>
  );
}
