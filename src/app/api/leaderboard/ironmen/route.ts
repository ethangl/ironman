import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeSongDifficulty, computeStreakScore } from "@/lib/difficulty";

export async function GET() {
  // Fetch all streaks with weakness counts to compute per-song stats
  const allStreaks = await prisma.streak.findMany({
    include: {
      _count: { select: { weaknesses: true } },
      user: { select: { name: true, image: true } },
    },
  });

  // Aggregate per-song stats
  const songStats = new Map<
    string,
    { totalPlays: number; totalAttempts: number; totalWeaknesses: number; trackDuration: number }
  >();

  for (const s of allStreaks) {
    const prev = songStats.get(s.trackId);
    if (prev) {
      prev.totalPlays += s.count;
      prev.totalAttempts += 1;
      prev.totalWeaknesses += s._count.weaknesses;
    } else {
      songStats.set(s.trackId, {
        totalPlays: s.count,
        totalAttempts: 1,
        totalWeaknesses: s._count.weaknesses,
        trackDuration: s.trackDuration,
      });
    }
  }

  // Score each streak
  const scored = allStreaks
    .filter((s) => s.count >= 3)
    .map((s) => {
      const stats = songStats.get(s.trackId)!;
      const songDifficulty = computeSongDifficulty(
        stats.trackDuration,
        stats.totalAttempts >= 3
          ? {
              weaknessRate: stats.totalWeaknesses / Math.max(stats.totalPlays, 1),
              avgCount: stats.totalPlays / stats.totalAttempts,
              totalAttempts: stats.totalAttempts,
            }
          : undefined,
      );
      const streakScore = computeStreakScore(songDifficulty, s.count, s.hardcore);

      return {
        rank: 0,
        id: s.id,
        userId: s.userId,
        count: s.count,
        active: s.active,
        hardcore: s.hardcore,
        trackId: s.trackId,
        trackName: s.trackName,
        trackArtist: s.trackArtist,
        trackImage: s.trackImage,
        startedAt: s.startedAt.toISOString(),
        userName: s.user.name,
        userImage: s.user.image,
        streakScore: Math.round(streakScore * 10) / 10,
        songDifficulty: Math.round(songDifficulty * 10) / 10,
      };
    })
    .sort((a, b) => b.streakScore - a.streakScore)
    .slice(0, 20)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  return NextResponse.json(scored);
}
