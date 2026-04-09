"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { AlbumArt } from "@/components/album-art";
import { List, ListItem } from "@/components/list";
import { TrackCell } from "@/components/track-cell";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useWebPlayerActions } from "@/hooks/use-web-player";
import { SpotifyArtistPageData } from "@/types";

function getRouteErrorMessage(data: unknown, fallback: string) {
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

export default function ArtistPage({
  params,
}: {
  params: Promise<{ artistId: string }>;
}) {
  const { artistId } = use(params);

  return <ArtistPageBody key={artistId} artistId={artistId} />;
}

function ArtistPageBody({ artistId }: { artistId: string }) {
  const [data, setData] = useState<SpotifyArtistPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { playTrack, playTracks } = useWebPlayerActions();

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/artists/${artistId}`)
      .then(async (r) => {
        const payload = await r.json().catch(() => null);

        if (!r.ok) {
          if (r.status === 404 && !cancelled) {
            setNotFound(true);
            return null;
          }

          throw new Error(
            getRouteErrorMessage(payload, "Could not load artist details."),
          );
        }

        return payload as SpotifyArtistPageData;
      })
      .then((nextData) => {
        if (!cancelled && nextData) {
          setData(nextData);
          setError(null);
          setNotFound(false);
        }
      })
      .catch((nextError) => {
        if (!cancelled) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "Could not load artist details.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [artistId]);

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
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
              Artist
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              {artist.name}
            </h1>
            {subtitle ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              {topTracks.length > 0 ? (
                <Button
                  variant="secondary"
                  onClick={() => void playTracks(topTracks)}
                >
                  Play Top Tracks
                </Button>
              ) : null}
              <Link
                href="/"
                className="inline-flex h-9 items-center rounded-4xl bg-white/10 px-3 text-sm font-medium transition hover:bg-white/15"
              >
                Back Home
              </Link>
            </div>
          </div>
        </div>
      </section>

      <List title="Top Tracks" loading={loading} count={topTracks.length}>
        {topTracks.map((song, i) => {
          const track = {
            trackId: song.id,
            trackArtist: song.artist,
            trackDuration: song.durationMs,
            trackImage: song.albumImage,
            trackName: song.name,
          };

          return (
            <ListItem key={track.trackId}>
              <span className="w-6 text-center text-sm font-bold text-muted-foreground">
                {i + 1}
              </span>
              <TrackCell track={track} />
            </ListItem>
          );
        })}
      </List>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">Releases</h2>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Albums and singles
          </span>
        </div>
        {releases.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {releases.map((release) => (
              <article
                key={release.id}
                className="rounded-2xl bg-white/5 p-4 transition hover:bg-white/10"
              >
                <div className="flex gap-4">
                  <AlbumArt
                    src={release.image}
                    className="size-16 rounded-xl"
                  />
                  <div className="min-w-0 space-y-1">
                    <h3 className="truncate text-sm font-medium">
                      {release.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {release.albumType ?? "release"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatReleaseDate(release.releaseDate)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {release.totalTracks} tracks
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Spotify did not return any releases for this artist.
          </p>
        )}
      </section>
    </main>
  );
}
