import { NextResponse } from "next/server";
import { getSessionOrUnauth, getSpotifyToken } from "@/lib/auth-helpers";
import { getRecentlyPlayed } from "@/lib/spotify";

export async function GET() {
  const { session, error } = await getSessionOrUnauth();
  if (error) return error;

  const token = await getSpotifyToken(session!.user.id);
  if (!token) {
    return NextResponse.json({ error: "No Spotify token" }, { status: 401 });
  }

  const items = await getRecentlyPlayed(token);
  return NextResponse.json(items);
}
