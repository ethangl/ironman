import { NextResponse } from "next/server";
import { getSessionOrUnauth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { session, error } = await getSessionOrUnauth();
  if (error) return error;

  const streak = await prisma.streak.findFirst({
    where: { userId: session!.user.id, active: true },
  });

  if (!streak) return NextResponse.json(null);

  return NextResponse.json({
    id: streak.id,
    trackId: streak.trackId,
    trackName: streak.trackName,
    trackArtist: streak.trackArtist,
    trackImage: streak.trackImage,
    trackDuration: streak.trackDuration,
    count: streak.count,
    active: streak.active,
    hardcore: streak.hardcore,
    startedAt: streak.startedAt.toISOString(),
  });
}
