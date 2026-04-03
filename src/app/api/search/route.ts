import { NextRequest, NextResponse } from "next/server";
import { getSessionOrUnauth, getSpotifyToken } from "@/lib/auth-helpers";
import { searchTracks } from "@/lib/spotify";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth();
  if (error) return error;

  const query = req.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const token = await getSpotifyToken(session!.user.id);
  if (!token) {
    return NextResponse.json({ error: "No Spotify token" }, { status: 401 });
  }

  const tracks = await searchTracks(query, token);

  // Batch lookup top streaks for all returned track IDs
  const trackIds = tracks.map((t) => t.id);
  const topStreaks = await prisma.streak.findMany({
    where: { trackId: { in: trackIds } },
    orderBy: { count: "desc" },
    include: { user: { select: { name: true } } },
  });

  // Build a map of trackId -> top streak
  const topByTrack = new Map<string, { count: number; userName: string | null }>();
  for (const s of topStreaks) {
    if (!topByTrack.has(s.trackId) && s.count > 0) {
      topByTrack.set(s.trackId, { count: s.count, userName: s.user.name });
    }
  }

  const results = tracks.map((t) => ({
    ...t,
    topStreak: topByTrack.get(t.id) ?? null,
  }));

  return NextResponse.json(results);
}
