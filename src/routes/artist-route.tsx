import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { AlbumArt } from "@/components/album-art";
import { List, ListItem } from "@/components/list";
import { Spinner } from "@/components/ui/spinner";
import { useArtistPageData } from "@/features/artist";
import { useSpotifyClient } from "@/features/spotify/client";
import {
  PlaylistCell,
  TrackCell,
  useWebPlayerActions,
} from "@/features/spotify/player";
import type { SpotifyAlbumRelease, Track } from "@/types";

function formatReleaseDate(value: string | null) {
  if (!value) return "Unknown release date";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: value.length > 4 ? "short" : undefined,
    day: value.length > 7 ? "numeric" : undefined,
  });
}

function formatFollowers(count: number) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M followers`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K followers`;
  return `${count} followers`;
}

function formatReleaseMeta(release: SpotifyAlbumRelease) {
  return [
    formatReleaseDate(release.releaseDate),
    `${release.totalTracks} tracks`,
  ].join(" • ");
}

export function ArtistRoute() {
  const client = useSpotifyClient();
  const { artistId = "" } = useParams();
  const { data, loading, error, notFound } = useArtistPageData(artistId);
  const { playTracks } = useWebPlayerActions();
  const [loadingReleaseId, setLoadingReleaseId] = useState<string | null>(null);
  const releaseTracksRef = useRef(new Map<string, Track[]>());

  const handlePlayRelease = async (release: SpotifyAlbumRelease) => {
    try {
      const cached = releaseTracksRef.current.get(release.id);
      if (cached) {
        await playTracks(cached);
        return;
      }

      setLoadingReleaseId(release.id);
      const tracks = await client.artists.getAlbumTracks(release.id);

      if (tracks.length === 0) {
        toast.error("That release does not have any playable tracks.");
        return;
      }

      releaseTracksRef.current.set(release.id, tracks);
      await playTracks(tracks);
    } catch (nextError) {
      toast.error(
        nextError instanceof Error
          ? nextError.message
          : "Could not load that release right now.",
      );
    } finally {
      setLoadingReleaseId((current) =>
        current === release.id ? null : current,
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner className="h-8 w-8 border-mist-500 border-t-white" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="py-32 text-center text-muted-foreground">
        Artist not found.
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-32 text-center text-muted-foreground">
        {error ?? "Could not load artist details."}
      </div>
    );
  }

  const { artist, releases, topTracks } = data;
  const subtitle =
    artist.genres.length > 0
      ? artist.genres.slice(0, 3).join(" • ")
      : artist.followerCount > 0
        ? formatFollowers(artist.followerCount)
        : null;

  return (
    <main className="space-y-12">
      <section className="rounded-3xl bg-white/5 p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <AlbumArt
            src={artist.image}
            className="size-32 rounded-3xl sm:size-40"
          />
          <div className="min-w-0 space-y-3">
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              {artist.name}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </section>

      <List title="Top Tracks" loading={loading} count={topTracks.length}>
        {topTracks.map((song, i) => {
          return (
            <ListItem key={song.id}>
              <TrackCell count={i + 1} track={song} />
            </ListItem>
          );
        })}
      </List>

      <List
        title="Albums"
        count={releases.length}
        empty="Spotify did not return any albums for this artist."
      >
        {releases.map((release, i) => (
          <ListItem key={release.id}>
            <PlaylistCell
              count={i + 1}
              disabled={loadingReleaseId === release.id}
              image={release.image}
              name={release.name}
              subtitle={formatReleaseMeta(release)}
              tracks={releaseTracksRef.current.get(release.id) ?? []}
              onPlay={() => void handlePlayRelease(release)}
            />
          </ListItem>
        ))}
      </List>
    </main>
  );
}
