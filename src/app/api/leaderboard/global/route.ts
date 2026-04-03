import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const streaks = await prisma.streak.findMany({
    orderBy: { count: "desc" },
    take: 20,
    include: {
      user: { select: { name: true, image: true } },
    },
  });

  const leaderboard = streaks.map((s, i) => ({
    rank: i + 1,
    id: s.id,
    count: s.count,
    active: s.active,
    trackId: s.trackId,
    trackName: s.trackName,
    trackArtist: s.trackArtist,
    trackImage: s.trackImage,
    startedAt: s.startedAt.toISOString(),
    userName: s.user.name,
    userImage: s.user.image,
  }));

  return NextResponse.json(leaderboard);
}
