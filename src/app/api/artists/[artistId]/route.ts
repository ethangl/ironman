import { NextResponse } from "next/server";

import { getSessionOrUnauth, getSpotifyToken } from "@/lib/auth-helpers";
import { spotifyCacheTtl } from "@/lib/spotify-cache-ttl";
import { getCachedSpotifyResult } from "@/lib/spotify-request-cache";
import { getArtistPageData, SpotifyApiError } from "@/lib/spotify";
import { createSpotifyRouteErrorResponse } from "@/lib/spotify-route-errors";

const ARTIST_PAGE_TTL_MS = spotifyCacheTtl(5 * 60_000);
const ARTIST_PAGE_CACHE_VERSION = "v5";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ artistId: string }> },
) {
  const { session, error } = await getSessionOrUnauth();
  if (error) return error;

  const token = await getSpotifyToken(session!.user.id);
  if (!token) {
    return NextResponse.json({ error: "No Spotify token" }, { status: 401 });
  }

  const { artistId } = await params;
  let cacheEvent: "hit" | "join" | "miss" | "store" | "stale" | "none" = "none";

  try {
    const data = await getCachedSpotifyResult(
      `artist-page:${ARTIST_PAGE_CACHE_VERSION}:${session!.user.id}:${artistId}`,
      ARTIST_PAGE_TTL_MS,
      () => getArtistPageData(token, artistId),
      {
        allowStaleOnError: true,
        onEvent: (event) => {
          cacheEvent = event;
        },
      },
    );

    if (process.env.NODE_ENV !== "test") {
      console.info(
        `[spotify-route] /api/artists/${artistId} cache=${cacheEvent} top_tracks=${data.topTracks.length} releases=${data.releases.length}`,
      );
    }

    return NextResponse.json(data, {
      headers: { "x-spotify-cache": cacheEvent },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        `[spotify-route] /api/artists/${artistId} cache=${cacheEvent} error=${error instanceof Error ? error.message : "unknown"}`,
      );
    }

    if (error instanceof SpotifyApiError && error.status === 404) {
      return createSpotifyRouteErrorResponse(
        error,
        "Could not find that artist on Spotify.",
      );
    }

    return createSpotifyRouteErrorResponse(
      error,
      "Could not load artist details right now.",
    );
  }
}
