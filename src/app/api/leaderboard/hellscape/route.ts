import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeSongDifficulty } from "@/lib/difficulty";

const getCachedHellscapeLeaderboard = unstable_cache(
  async () => {
    const streaks = await prisma.streak.findMany({
      include: { _count: { select: { weaknesses: true } } },
    });

    const byTrack = new Map<
      string,
      {
        trackName: string;
        trackArtist: string;
        trackImage: string | null;
        trackDuration: number;
        totalPlays: number;
        totalAttempts: number;
        totalWeaknesses: number;
      }
    >();

    for (const s of streaks) {
      const prev = byTrack.get(s.trackId);
      if (prev) {
        prev.totalPlays += s.count;
        prev.totalAttempts += 1;
        prev.totalWeaknesses += s._count.weaknesses;
      } else {
        byTrack.set(s.trackId, {
          trackName: s.trackName,
          trackArtist: s.trackArtist,
          trackImage: s.trackImage,
          trackDuration: s.trackDuration,
          totalPlays: s.count,
          totalAttempts: 1,
          totalWeaknesses: s._count.weaknesses,
        });
      }
    }

    return Array.from(byTrack.entries())
      .filter(([, s]) => s.totalAttempts >= 3)
      .map(([trackId, s]) => {
        const avgCount = s.totalPlays / s.totalAttempts;
        const weaknessRate = s.totalWeaknesses / Math.max(s.totalPlays, 1);
        const difficulty = computeSongDifficulty(s.trackDuration, {
          weaknessRate,
          avgCount,
          totalAttempts: s.totalAttempts,
        });
        return {
          trackId,
          trackName: s.trackName,
          trackArtist: s.trackArtist,
          trackImage: s.trackImage,
          trackDuration: s.trackDuration,
          difficulty,
          totalAttempts: s.totalAttempts,
          avgCount: Math.round(avgCount),
          weaknessRate: Math.round(weaknessRate * 100) / 100,
        };
      })
      .sort((a, b) => b.difficulty - a.difficulty)
      .slice(0, 20);
  },
  ["hellscape-leaderboard"],
  { revalidate: 30 },
);

export async function GET() {
  const songs = await getCachedHellscapeLeaderboard();
  return NextResponse.json(songs);
}
