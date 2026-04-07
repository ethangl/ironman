import { NextResponse } from "next/server";
import { getSessionOrUnauth, getSpotifyToken } from "@/lib/auth-helpers";
import {
  getCachedSpotifyResult,
  setCachedSpotifyResult,
} from "@/lib/spotify-request-cache";
import { getRecentlyPlayed, SpotifyApiError } from "@/lib/spotify";

const RECENTLY_PLAYED_TTL_MS = 15_000;
const RECENTLY_PLAYED_RATE_LIMIT_FALLBACK_MS = 30_000;

export async function GET() {
  const { session, error } = await getSessionOrUnauth();
  if (error) return error;

  const token = await getSpotifyToken(session!.user.id);
  if (!token) {
    return NextResponse.json({ error: "No Spotify token" }, { status: 401 });
  }

  try {
    const items = await getCachedSpotifyResult(
      `recently-played:${session!.user.id}`,
      RECENTLY_PLAYED_TTL_MS,
      () => getRecentlyPlayed(token),
      { allowStaleOnError: true },
    );
    return NextResponse.json(items);
  } catch (error) {
    if (error instanceof SpotifyApiError && error.status === 429) {
      const cooldownMs = Math.max(
        (error.retryAfterSeconds ?? 0) * 1000,
        RECENTLY_PLAYED_RATE_LIMIT_FALLBACK_MS,
      );
      setCachedSpotifyResult(`recently-played:${session!.user.id}`, [], cooldownMs);
      return NextResponse.json(
        [],
        { headers: { "x-spotify-rate-limited": "1" } },
      );
    }
    throw error;
  }
}
