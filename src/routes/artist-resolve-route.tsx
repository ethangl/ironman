import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { Spinner } from "@/components/ui/spinner";
import { getSpotifyArtistIdByMusicBrainzArtistId } from "@/features/artist/musicbrainz-client";
import {
  cacheSpotifyArtistIdForMusicBrainzArtist,
  getCachedSpotifyArtistIdForMusicBrainzArtist,
  normalizeLastFmUrl,
} from "@/features/artist/similar-artist-links";
import { SpotifyError } from "@/features/spotify-shell/spotify-error";
import { SpotifyHeader } from "@/features/spotify-shell/spotify-header";

export function ArtistResolveRoute() {
  const navigate = useNavigate();
  const { musicBrainzArtistId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
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

    void getSpotifyArtistIdByMusicBrainzArtistId(musicBrainzArtistId)
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
  }, [fallbackUrl, musicBrainzArtistId, navigate]);

  if (error) {
    return <SpotifyError href="/home" />;
  }

  return <SpotifyHeader href="/home" title={<Spinner />} />;
}
