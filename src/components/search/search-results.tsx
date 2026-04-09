"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { AlbumArt } from "@/components/album-art";
import { Button } from "@/components/ui/button";
import { useWebPlayerActions } from "@/hooks/use-web-player";
import { cn } from "@/lib/utils";
import { PlayableTrack, SpotifyArtist, SpotifyPlaylist } from "@/types";
import { List, ListItem } from "../list";
import { TrackCell } from "../track-cell";
import { ScrollArea } from "../ui/scroll-area";
import { useSearch } from "./search-provider";

function getSearchErrorMessage(data: unknown, fallback: string) {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    data.error &&
    typeof data.error === "object" &&
    "message" in data.error &&
    typeof data.error.message === "string"
  ) {
    return data.error.message;
  }

  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof data.error === "string"
  ) {
    return data.error;
  }

  return fallback;
}

function toPlayableTrack(track: {
  id: string;
  name: string;
  artist: string;
  albumImage: string | null;
  durationMs: number;
}): PlayableTrack {
  return {
    id: track.id,
    name: track.name,
    artist: track.artist,
    albumImage: track.albumImage,
    durationMs: track.durationMs,
  };
}

function SearchEntityCard({
  image,
  title,
  subtitle,
  meta,
  action,
  href,
}: {
  image: string | null;
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  action?: React.ReactNode;
  href?: string;
}) {
  const content = (
    <>
      <AlbumArt src={image} className="size-10 rounded-lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {href ? (
            <Link href={href} className="transition hover:text-foreground">
              {title}
            </Link>
          ) : (
            title
          )}
        </p>
        {subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
        {meta ? (
          <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground/80">
            {meta}
          </p>
        ) : null}
      </div>
    </>
  );

  return (
    <div className="flex items-center gap-4 rounded-xl bg-white/5 p-3 transition hover:bg-white/10">
      {content}
      {action}
    </div>
  );
}

function ArtistResultCard({ artist }: { artist: SpotifyArtist }) {
  return (
    <SearchEntityCard
      image={artist.image}
      title={artist.name}
      meta="Artist"
      href={`/artist/${artist.id}`}
    />
  );
}

function PlaylistResultCard({
  playlist,
  loading,
  onPlay,
}: {
  playlist: SpotifyPlaylist;
  loading: boolean;
  onPlay: (playlist: SpotifyPlaylist) => Promise<void>;
}) {
  const subtitle = playlist.owner
    ? `${playlist.trackCount} songs • by ${playlist.owner}`
    : `${playlist.trackCount} songs`;

  return (
    <SearchEntityCard
      image={playlist.image}
      title={playlist.name}
      subtitle={subtitle}
      meta="Public playlist"
      action={
        <Button
          size="sm"
          variant="secondary"
          disabled={loading}
          onClick={() => void onPlay(playlist)}
        >
          {loading ? "Loading..." : "Play"}
        </Button>
      }
    />
  );
}

export function SearchResults() {
  const { query, results, loading, error } = useSearch();
  const { playTracks } = useWebPlayerActions();
  const [loadingPlaylistId, setLoadingPlaylistId] = useState<string | null>(
    null,
  );
  const playlistTracksRef = useRef(new Map<string, PlayableTrack[]>());

  const trimmedQuery = query.trim();
  const hasResults =
    results.tracks.length > 0 ||
    results.artists.length > 0 ||
    results.playlists.length > 0;

  const handlePlayPlaylist = async (playlist: SpotifyPlaylist) => {
    try {
      const cached = playlistTracksRef.current.get(playlist.id);
      if (cached) {
        await playTracks(cached);
        return;
      }

      setLoadingPlaylistId(playlist.id);
      const res = await fetch(`/api/playlists/${playlist.id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          getSearchErrorMessage(data, "Could not load playlist tracks."),
        );
      }

      const tracks = Array.isArray(data?.items)
        ? data.items.map(toPlayableTrack)
        : [];

      if (tracks.length === 0) {
        toast.error("That playlist does not have any playable tracks.");
        return;
      }

      playlistTracksRef.current.set(playlist.id, tracks);
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
        "search-results backdrop-blur-lg backdrop-brightness-25 fixed inset-0 overscroll-auto transition-discrete starting:opacity-0 duration-555 ease-out top-16 z-15",
        // !hasResults && "hidden opacity-0 pointer-events-none",
      )}
    >
      <ScrollArea className="size-full">
        <div className="p-4 space-y-4">
          <List title="Songs" count={results.tracks.length}>
            {results.tracks.map((track, i) => (
              <ListItem key={track.id}>
                <TrackCell
                  count={i + 1}
                  track={{
                    trackId: track.id,
                    trackName: track.name,
                    trackArtist: track.artist,
                    trackImage: track.albumImage,
                    trackDuration: track.durationMs,
                  }}
                />
              </ListItem>
            ))}
          </List>

          <List title="Playlists" count={results.playlists.length}>
            {results.playlists.map((playlist) => (
              <PlaylistResultCard
                key={playlist.id}
                playlist={playlist}
                loading={loadingPlaylistId === playlist.id}
                onPlay={handlePlayPlaylist}
              />
            ))}
          </List>

          <List title="Artists" count={results.artists.length}>
            {results.artists.map((artist) => (
              <ArtistResultCard key={artist.id} artist={artist} />
            ))}
          </List>
        </div>
      </ScrollArea>
    </div>
  );
}
