import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const streaks = await prisma.streak.findMany({
    where: { userId: session.user.id },
    orderBy: { count: "desc" },
  });
  const visibleStreaks = streaks.filter((s) => s.count > 1);

  const totalPlays = visibleStreaks.reduce((sum, s) => sum + s.count, 0);
  const totalStreaks = visibleStreaks.length;
  const bestStreak = visibleStreaks[0] ?? null;
  const activeStreak = visibleStreaks.find((s) => s.active) ?? null;
  const uniqueSongs = new Set(visibleStreaks.map((s) => s.trackId)).size;

  // Count weaknesses across all streaks
  const weaknessCount = await prisma.weakness.count({
    where: { streakId: { in: visibleStreaks.map((s) => s.id) } },
  });

  return NextResponse.json({
    user: {
      id: session.user.id,
      name: session.user.name,
      image: session.user.image,
    },
    stats: {
      totalPlays,
      totalStreaks,
      uniqueSongs,
      weaknessCount,
    },
    bestStreak: bestStreak
      ? {
          trackName: bestStreak.trackName,
          trackArtist: bestStreak.trackArtist,
          trackImage: bestStreak.trackImage,
          trackId: bestStreak.trackId,
          count: bestStreak.count,
        }
      : null,
    activeStreak: activeStreak
      ? {
          trackName: activeStreak.trackName,
          trackArtist: activeStreak.trackArtist,
          trackImage: activeStreak.trackImage,
          trackId: activeStreak.trackId,
          count: activeStreak.count,
        }
      : null,
    history: visibleStreaks.map((s) => ({
      id: s.id,
      trackId: s.trackId,
      trackName: s.trackName,
      trackArtist: s.trackArtist,
      trackImage: s.trackImage,
      count: s.count,
      active: s.active,
      startedAt: s.startedAt.toISOString(),
      endedAt: s.endedAt?.toISOString() ?? null,
    })),
  });
}
