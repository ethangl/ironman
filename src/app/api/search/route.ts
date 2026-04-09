import { NextRequest, NextResponse } from "next/server";
import { getSessionOrUnauth, getSpotifyToken } from "@/lib/auth-helpers";
import { searchSpotify } from "@/lib/spotify";
import { prisma } from "@/lib/prisma";
import { computeSongDifficulty } from "@/lib/difficulty";
import { createSpotifyRouteErrorResponse } from "@/lib/spotify-route-errors";

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

  try {
    const searchResults = await searchSpotify(query, token);
    const { artists, playlists, tracks } = searchResults;

    // Batch lookup top streaks for all returned track IDs
    const trackIds = tracks.map((t) => t.id);
    const topStreaks =
      trackIds.length > 0
        ? await prisma.streak.findMany({
            where: { trackId: { in: trackIds } },
            orderBy: { count: "desc" },
            include: { user: { select: { name: true } } },
          })
        : [];

    // Build maps: top streak + aggregate stats per track
    const topByTrack = new Map<string, { count: number; userName: string | null }>();
    const statsByTrack = new Map<string, { totalPlays: number; totalAttempts: number; totalWeaknesses: number }>();

    for (const s of topStreaks) {
      if (!topByTrack.has(s.trackId) && s.count > 0) {
        topByTrack.set(s.trackId, { count: s.count, userName: s.user.name });
      }
      const prev = statsByTrack.get(s.trackId) ?? { totalPlays: 0, totalAttempts: 0, totalWeaknesses: 0 };
      prev.totalPlays += s.count;
      prev.totalAttempts += 1;
      statsByTrack.set(s.trackId, prev);
    }

    // Batch fetch weakness counts for tracks that have streaks
    const streakIds = topStreaks.map((s) => s.id);
    if (streakIds.length > 0) {
      const weaknessCounts = await prisma.weakness.groupBy({
        by: ["streakId"],
        where: { streakId: { in: streakIds } },
        _count: true,
      });
      for (const w of weaknessCounts) {
        const streak = topStreaks.find((s) => s.id === w.streakId);
        if (streak) {
          const prev = statsByTrack.get(streak.trackId);
          if (prev) prev.totalWeaknesses += w._count;
        }
      }
    }

    const results = tracks.map((t) => {
      const stats = statsByTrack.get(t.id);
      const difficulty = computeSongDifficulty(
        t.durationMs,
        stats && stats.totalAttempts >= 3
          ? {
              weaknessRate: stats.totalWeaknesses / Math.max(stats.totalPlays, 1),
              avgCount: stats.totalPlays / stats.totalAttempts,
              totalAttempts: stats.totalAttempts,
            }
          : undefined,
      );
      return {
        ...t,
        topStreak: topByTrack.get(t.id) ?? null,
        difficulty,
      };
    });

    return NextResponse.json({
      tracks: results,
      artists,
      playlists,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        `[spotify-route] /api/search query=${query} error=${error instanceof Error ? error.message : "unknown"}`,
      );
    }

    return createSpotifyRouteErrorResponse(
      error,
      "Could not search Spotify right now.",
    );
  }
}
