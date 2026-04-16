import { useState } from "react";
import { toast } from "sonner";

import { AppLink } from "@/components/app-link";
import { List, ListItem } from "@/components/list";
import { Section } from "@/components/section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSpotifyClient } from "@/features/spotify/client";
import {
  PlaylistCell,
  TrackCell,
  useWebPlayerActions,
} from "@/features/spotify/player";
import { cn } from "@/lib/utils";
import { SpotifyPlaylist, Track } from "@/types";
import { Thumbnail } from "../spotify/activity/thumbnail";
import { useSearch } from "./search-provider";

export function SearchResults() {
  const client = useSpotifyClient();
  const { query, results, loading, error } = useSearch();
  const { playTracks } = useWebPlayerActions();
  const [loadingPlaylistId, setLoadingPlaylistId] = useState<string | null>(
    null,
  );
  const [playlistTracksById, setPlaylistTracksById] = useState<
    Record<string, Track[]>
  >({});

  const trimmedQuery = query.trim();
  const hasResults =
    results.tracks.length > 0 ||
    results.artists.length > 0 ||
    results.playlists.length > 0;

  const handlePlayPlaylist = async (playlist: SpotifyPlaylist) => {
    try {
      const cached = playlistTracksById[playlist.id];
      if (cached) {
        await playTracks(cached);
        return;
      }

      setLoadingPlaylistId(playlist.id);
      const tracks = await client.spotifyActivity.getPlaylistTracks(
        playlist.id,
      );

      if (tracks.length === 0) {
        toast.error("That playlist does not have any playable tracks.");
        return;
      }

      setPlaylistTracksById((current) => ({
        ...current,
        [playlist.id]: tracks,
      }));
      await playTracks(tracks);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not load playlist tracks.",
      );
    } finally {
      setLoadingPlaylistId((current) =>
        current === playlist.id ? null : current,
      );
    }
  };

  if (!trimmedQuery) return null;

  if (error) {
    return <p className="mt-3 text-sm text-red-300/90">{error}</p>;
  }

  if (!loading && !hasResults) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        No songs, artists, or playlists matched that search.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "transition-discrete starting:opacity-0 duration-555 ease-out z-15",
        // !hasResults && "hidden opacity-0 pointer-events-none",
      )}
    >
      <Section
        title={`Songs matching "${trimmedQuery}"`}
        color="--color-emerald-400"
      >
        <List count={results.tracks.length} className="p-4">
          {results.tracks.map((track, i) => (
            <ListItem key={track.id}>
              <TrackCell count={i + 1} track={track} />
            </ListItem>
          ))}
        </List>
      </Section>
      <Section
        title={`Playlists matching "${trimmedQuery}"`}
        color="--color-emerald-400"
      >
        <List count={results.playlists.length} className="p-4">
          {results.playlists.map((playlist, i) => (
            <ListItem key={playlist.id}>
              <PlaylistCell
                count={i + 1}
                disabled={loadingPlaylistId === playlist.id}
                image={playlist.image}
                name={playlist.name}
                subtitle={
                  playlist.owner
                    ? `${playlist.trackCount} songs by ${playlist.owner}`
                    : `${playlist.trackCount} songs`
                }
                tracks={playlistTracksById[playlist.id] ?? []}
                onPlay={() => void handlePlayPlaylist(playlist)}
              />
            </ListItem>
          ))}
        </List>
      </Section>
      <Section
        title={`Artists matching "${trimmedQuery}"`}
        color="--color-emerald-400"
      >
        <ScrollArea>
          <ol className="flex gap-4 p-4 w-max">
            {results.artists.map((artist) => (
              <li key={artist.id}>
                <AppLink href={`/artist/${artist.id}`}>
                  <Thumbnail name={artist.name} src={artist.image} />
                </AppLink>
              </li>
            ))}
          </ol>
        </ScrollArea>
      </Section>
    </div>
  );
}
