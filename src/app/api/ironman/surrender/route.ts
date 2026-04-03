import { NextResponse } from "next/server";
import { getSessionOrUnauth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { logFeedEvent } from "@/lib/feed";

export async function POST() {
  const { session, error } = await getSessionOrUnauth();
  if (error) return error;

  const streak = await prisma.streak.findFirst({
    where: { userId: session!.user.id, active: true },
  });

  if (!streak) {
    return NextResponse.json({ error: "No active streak" }, { status: 404 });
  }

  const updated = await prisma.streak.update({
    where: { id: streak.id },
    data: { active: false, endedAt: new Date() },
  });

  await logFeedEvent(
    streak.id,
    session!.user.id,
    "surrender",
    streak.trackName,
    streak.trackArtist,
    `${streak.count} plays`
  );

  return NextResponse.json(updated);
}
