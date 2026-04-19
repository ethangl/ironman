import type { LastFmSimilarArtist } from "@/types";

const SIMILAR_ARTIST_SPOTIFY_ID_CACHE_PREFIX =
  "ironman:artist-spotify-id-by-mbid:";

function getSimilarArtistSpotifyCacheKey(musicBrainzArtistId: string) {
  return `${SIMILAR_ARTIST_SPOTIFY_ID_CACHE_PREFIX}${musicBrainzArtistId}`;
}

export function normalizeLastFmUrl(url: string | null) {
  if (typeof url !== "string") {
    return null;
  }

  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return null;
  }

  const candidates = /^https?:\/\//i.test(trimmedUrl)
    ? [trimmedUrl]
    : [`https://${trimmedUrl.replace(/^\/+/, "")}`];

  for (const candidate of candidates) {
    try {
      const parsed = new URL(candidate);
      const normalizedHostname = parsed.hostname.toLowerCase();
      if (
        (parsed.protocol === "https:" || parsed.protocol === "http:") &&
        (normalizedHostname === "last.fm" ||
          normalizedHostname.endsWith(".last.fm"))
      ) {
        return parsed.toString();
      }
    } catch {
      continue;
    }
  }

  return null;
}

export function getCachedSpotifyArtistIdForMusicBrainzArtist(
  musicBrainzArtistId: string,
) {
  if (typeof window === "undefined" || !musicBrainzArtistId) {
    return null;
  }

  try {
    const value = window.localStorage.getItem(
      getSimilarArtistSpotifyCacheKey(musicBrainzArtistId),
    );
    return value && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

export function cacheSpotifyArtistIdForMusicBrainzArtist(
  musicBrainzArtistId: string,
  spotifyArtistId: string,
) {
  if (
    typeof window === "undefined" ||
    !musicBrainzArtistId ||
    !spotifyArtistId
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      getSimilarArtistSpotifyCacheKey(musicBrainzArtistId),
      spotifyArtistId,
    );
  } catch {
    // Ignore localStorage failures and rely on the backend cache.
  }
}

export function getSimilarArtistLink(similarArtist: LastFmSimilarArtist): {
  href: string | null;
  external: boolean;
} {
  const fallbackUrl = normalizeLastFmUrl(similarArtist.url);

  if (!similarArtist.musicBrainzId) {
    return {
      href: fallbackUrl,
      external: true,
    };
  }

  const cachedSpotifyArtistId = getCachedSpotifyArtistIdForMusicBrainzArtist(
    similarArtist.musicBrainzId,
  );
  if (cachedSpotifyArtistId) {
    return {
      href: `/artist/${cachedSpotifyArtistId}`,
      external: false,
    };
  }

  const searchParams = new URLSearchParams();
  if (fallbackUrl) {
    searchParams.set("fallback", fallbackUrl);
  }
  if (similarArtist.name) {
    searchParams.set("name", similarArtist.name);
  }

  return {
    href: `/artist/resolve/${encodeURIComponent(similarArtist.musicBrainzId)}${
      searchParams.toString().length > 0 ? `?${searchParams.toString()}` : ""
    }`,
    external: false,
  };
}
