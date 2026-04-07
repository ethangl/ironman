import { NextResponse } from "next/server";

import { getSessionOrUnauth, getSpotifyToken } from "@/lib/auth-helpers";
import { getCachedSpotifyResult } from "@/lib/spotify-request-cache";
import { getPlaylistTracks, SpotifyApiError } from "@/lib/spotify";
import { createSpotifyRouteErrorResponse } from "@/lib/spotify-route-errors";

const PLAYLIST_TRACKS_TTL_MS = 5 * 60_000;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ playlistId: string }> },
) {
  const { session, error } = await getSessionOrUnauth();
  if (error) return error;

  const token = await getSpotifyToken(session!.user.id);
  if (!token) {
    return NextResponse.json({ error: "No Spotify token" }, { status: 401 });
  }

  const { playlistId } = await params;
  let cacheEvent: "hit" | "join" | "miss" | "store" | "stale" | "none" = "none";
  try {
    const tracks = await getCachedSpotifyResult(
      `playlist-tracks:${session!.user.id}:${playlistId}`,
      PLAYLIST_TRACKS_TTL_MS,
      () => getPlaylistTracks(token, playlistId),
      {
        allowStaleOnError: true,
        onEvent: (event) => {
          cacheEvent = event;
        },
      },
    );
    if (process.env.NODE_ENV !== "test") {
      console.info(
        `[spotify-route] /api/playlists/${playlistId} cache=${cacheEvent} items=${tracks.length}`,
      );
    }
    return NextResponse.json(
      { items: tracks },
      { headers: { "x-spotify-cache": cacheEvent } },
    );
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        `[spotify-route] /api/playlists/${playlistId} cache=${cacheEvent} error=${error instanceof Error ? error.message : "unknown"}`,
      );
    }
    if (error instanceof SpotifyApiError) {
      if (error.status === 403) {
        return createSpotifyRouteErrorResponse(
          error,
          "Spotify denied access to this playlist. Reconnect Spotify to grant collaborative playlist access, or try a different playlist.",
        );
      }

      if (error.status === 429) {
        return createSpotifyRouteErrorResponse(
          error,
          "Spotify rate limited playlist track lookup.",
        );
      }
    }

    return createSpotifyRouteErrorResponse(
      error,
      "Could not load playlist tracks right now.",
    );
  }
}
