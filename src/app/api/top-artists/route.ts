import { NextRequest, NextResponse } from "next/server";

import { getSessionOrUnauth, getSpotifyToken } from "@/lib/auth-helpers";
import { spotifyCacheTtl } from "@/lib/spotify-cache-ttl";
import { getCachedSpotifyResult } from "@/lib/spotify-request-cache";
import { getTopArtists } from "@/lib/spotify";
import { createSpotifyRouteErrorResponse } from "@/lib/spotify-route-errors";

const TOP_ARTISTS_TTL_MS = spotifyCacheTtl(5 * 60_000);

export async function GET(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth();
  if (error) return error;

  const token = await getSpotifyToken(session!.user.id);
  if (!token) {
    return NextResponse.json({ error: "No Spotify token" }, { status: 401 });
  }

  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 20);
  let cacheEvent: "hit" | "join" | "miss" | "store" | "stale" | "none" = "none";

  try {
    const items = await getCachedSpotifyResult(
      `top-artists:${session!.user.id}:${limit}`,
      TOP_ARTISTS_TTL_MS,
      () => getTopArtists(token, limit),
      {
        allowStaleOnError: true,
        onEvent: (event) => {
          cacheEvent = event;
        },
      },
    );

    if (process.env.NODE_ENV !== "test") {
      console.info(
        `[spotify-route] /api/top-artists limit=${limit} cache=${cacheEvent} items=${items.length}`,
      );
    }

    return NextResponse.json(items, {
      headers: { "x-spotify-cache": cacheEvent },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        `[spotify-route] /api/top-artists limit=${limit} cache=${cacheEvent} error=${error instanceof Error ? error.message : "unknown"}`,
      );
    }

    return createSpotifyRouteErrorResponse(
      error,
      "Could not load your favorite artists right now.",
    );
  }
}
