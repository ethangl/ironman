import { NextRequest, NextResponse } from "next/server";
import { getSessionOrUnauth, getSpotifyToken } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { playTrack, setRepeatMode } from "@/lib/spotify";

export async function POST(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth();
  if (error) return error;

  const token = await getSpotifyToken(session!.user.id);
  console.log("[ironman/start] token type:", typeof token, "length:", token?.length, "preview:", token?.substring(0, 20));
  if (!token) {
    return NextResponse.json({ error: "No Spotify token" }, { status: 401 });
  }

  const { trackId, trackName, trackArtist, trackImage, trackDuration } =
    await req.json();

  if (!trackId || !trackName || !trackArtist || !trackDuration) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existing = await prisma.streak.findFirst({
    where: { userId: session!.user.id, active: true },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Already in ironman mode. Surrender first." },
      { status: 409 }
    );
  }

  try {
    await playTrack(trackId, token);
    await setRepeatMode("track", token);
  } catch (e: any) {
    console.error("[ironman/start] playback error:", e.message);
    return NextResponse.json(
      { error: e.message || "Failed to start playback. Is Spotify open on a device?" },
      { status: 502 }
    );
  }

  const streak = await prisma.streak.create({
    data: {
      userId: session!.user.id,
      trackId,
      trackName,
      trackArtist,
      trackImage,
      trackDuration,
    },
  });

  return NextResponse.json({
    id: streak.id,
    trackId: streak.trackId,
    trackName: streak.trackName,
    trackArtist: streak.trackArtist,
    trackImage: streak.trackImage,
    trackDuration: streak.trackDuration,
    count: streak.count,
    active: streak.active,
    startedAt: streak.startedAt.toISOString(),
  });
}
