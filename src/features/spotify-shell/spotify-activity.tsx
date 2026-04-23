import { LibraryIcon, PanelLeftCloseIcon, RefreshCwIcon } from "lucide-react";

import { LoadMoreButton } from "@/components/load-more-button";
import {
  SidebarContent,
  SidebarHeader,
  SidebarToggle,
} from "@/components/sidebar";
import { Button } from "@/components/ui/button";
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
            recentTracksHasMore && (
              <LoadMoreButton
                disabled={recentTracksLoading || recentTracksLoadingMore}
                loading={recentTracksLoadingMore}
                onClick={() => void loadMoreRecentTracks()}
              />
            )
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
            playlistsHasMore && (
              <LoadMoreButton
                disabled={playlistsLoading || playlistsLoadingMore}
                loading={playlistsLoadingMore}
                onClick={() => void loadMorePlaylists()}
              />
            )
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
            favoriteArtistsHasMore && (
              <LoadMoreButton
                disabled={favoriteArtistsLoading || favoriteArtistsLoadingMore}
                loading={favoriteArtistsLoadingMore}
                onClick={() => void loadMoreFavoriteArtists()}
              />
            )
          }
        />
      </SidebarContent>
    </>
  );
}
