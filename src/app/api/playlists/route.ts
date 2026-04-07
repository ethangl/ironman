import { NextRequest, NextResponse } from "next/server";
import { getSessionOrUnauth, getSpotifyToken } from "@/lib/auth-helpers";
import { getUserPlaylists } from "@/lib/spotify";

export async function GET(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth();
  if (error) return error;

  const token = await getSpotifyToken(session!.user.id);
  if (!token) {
    return NextResponse.json({ error: "No Spotify token" }, { status: 401 });
  }

  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 50);
  const offset = Number(req.nextUrl.searchParams.get("offset") ?? 0);

  const data = await getUserPlaylists(token, limit, offset);
  return NextResponse.json(data);
}
