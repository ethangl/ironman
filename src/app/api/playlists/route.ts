import { NextRequest, NextResponse } from "next/server";
import { getSessionOrUnauth, getSpotifyToken } from "@/lib/auth-helpers";
import { getCachedSpotifyResult } from "@/lib/spotify-request-cache";
import { getUserPlaylists } from "@/lib/spotify";
import { createSpotifyRouteErrorResponse } from "@/lib/spotify-route-errors";

const PLAYLISTS_TTL_MS = 5 * 60_000;

export async function GET(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth();
  if (error) return error;

  const token = await getSpotifyToken(session!.user.id);
  if (!token) {
    return NextResponse.json({ error: "No Spotify token" }, { status: 401 });
  }

  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 50);
  const offset = Number(req.nextUrl.searchParams.get("offset") ?? 0);
  let cacheEvent: "hit" | "join" | "miss" | "store" | "stale" | "none" = "none";

  try {
    const data = await getCachedSpotifyResult(
      `playlists:${session!.user.id}:${limit}:${offset}`,
      PLAYLISTS_TTL_MS,
      () => getUserPlaylists(token, limit, offset),
      {
        allowStaleOnError: true,
        onEvent: (event) => {
          cacheEvent = event;
        },
      },
    );
    if (process.env.NODE_ENV !== "test") {
      console.info(
        `[spotify-route] /api/playlists limit=${limit} offset=${offset} cache=${cacheEvent} items=${data.items.length} total=${data.total}`,
      );
    }
    return NextResponse.json(data, {
      headers: { "x-spotify-cache": cacheEvent },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        `[spotify-route] /api/playlists limit=${limit} offset=${offset} cache=${cacheEvent} error=${error instanceof Error ? error.message : "unknown"}`,
      );
    }
    return createSpotifyRouteErrorResponse(
      error,
      "Could not load your Spotify playlists right now.",
    );
  }
}
