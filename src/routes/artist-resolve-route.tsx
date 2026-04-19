import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { Spinner } from "@/components/ui/spinner";
import {
  cacheSpotifyArtistIdForMusicBrainzArtist,
  getCachedSpotifyArtistIdForMusicBrainzArtist,
  normalizeLastFmUrl,
} from "@/features/artist/similar-artist-links";
import { useSpotifyClient } from "@/features/spotify/client";

export function ArtistResolveRoute() {
  const client = useSpotifyClient();
  const navigate = useNavigate();
  const { musicBrainzArtistId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const artistName = searchParams.get("name")?.trim() || "artist";
  const fallbackUrl = normalizeLastFmUrl(searchParams.get("fallback"));

  useEffect(() => {
    let cancelled = false;

    if (!musicBrainzArtistId) {
      setError("Could not find this artist.");
      return;
    }

    const cachedSpotifyArtistId =
      getCachedSpotifyArtistIdForMusicBrainzArtist(musicBrainzArtistId);
    if (cachedSpotifyArtistId) {
      navigate(`/artist/${cachedSpotifyArtistId}`, { replace: true });
      return;
    }

    void client.artists
      .getSpotifyArtistIdByMusicBrainzArtistId(musicBrainzArtistId)
      .then((spotifyArtistId) => {
        if (cancelled) {
          return;
        }

        if (spotifyArtistId) {
          cacheSpotifyArtistIdForMusicBrainzArtist(
            musicBrainzArtistId,
            spotifyArtistId,
          );
          navigate(`/artist/${spotifyArtistId}`, { replace: true });
          return;
        }

        if (fallbackUrl) {
          window.location.replace(fallbackUrl);
          return;
        }

        setError("Could not find this artist in Spotify.");
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        if (fallbackUrl) {
          window.location.replace(fallbackUrl);
          return;
        }

        setError("Could not open this artist right now.");
      });

    return () => {
      cancelled = true;
    };
  }, [client, fallbackUrl, musicBrainzArtistId, navigate]);

  if (error) {
    return (
      <div className="px-6 py-32 text-center text-muted-foreground">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-32 text-center text-muted-foreground">
      <Spinner className="h-8 w-8 border-mist-500 border-t-white" />
      <div className="space-y-1">
        <p>Opening {artistName}…</p>
        <p className="text-sm text-muted-foreground/75">
          Resolving the artist link.
        </p>
      </div>
    </div>
  );
}
