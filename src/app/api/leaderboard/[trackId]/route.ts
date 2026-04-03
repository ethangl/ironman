import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  const { trackId } = await params;

  let currentUserId: string | null = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    currentUserId = session?.user?.id ?? null;
  } catch {}

  // Get all streaks for this track, ordered by count desc
  const allStreaks = await prisma.streak.findMany({
    where: { trackId },
    orderBy: { count: "desc" },
    include: {
      user: { select: { id: true, name: true, image: true } },
      _count: { select: { weaknesses: true } },
    },
  });

  // Deduplicate: keep only each user's best streak
  const seen = new Set<string>();
  const deduped = allStreaks.filter((s) => {
    if (seen.has(s.userId)) return false;
    seen.add(s.userId);
    return true;
  });

  // Top 10
  const top10 = deduped.slice(0, 10);
  const leaderboard = top10.map((s, i) => ({
    rank: i + 1,
    id: s.id,
    userId: s.userId,
    count: s.count,
    active: s.active,
    startedAt: s.startedAt.toISOString(),
    trackName: s.trackName,
    trackArtist: s.trackArtist,
    trackImage: s.trackImage,
    userName: s.user.name,
    userImage: s.user.image,
    isMe: s.userId === currentUserId,
    weaknessCount: s._count.weaknesses,
  }));

  // If current user isn't in top 10, find their best streak
  let myEntry = null;
  if (currentUserId && !leaderboard.some((e) => e.isMe)) {
    const myIdx = deduped.findIndex((s) => s.userId === currentUserId);
    if (myIdx !== -1 && deduped[myIdx].count > 0) {
      const s = deduped[myIdx];
      myEntry = {
        rank: myIdx + 1,
        id: s.id,
        userId: s.userId,
        count: s.count,
        active: s.active,
        startedAt: s.startedAt.toISOString(),
        trackName: s.trackName,
        trackArtist: s.trackArtist,
        trackImage: s.trackImage,
        userName: s.user.name,
        userImage: s.user.image,
        isMe: true,
        weaknessCount: s._count.weaknesses,
      };
    }
  }

  return NextResponse.json({ leaderboard, myEntry });
}
