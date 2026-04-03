import { NextRequest, NextResponse } from "next/server";
import { getSessionOrUnauth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { logFeedEvent } from "@/lib/feed";

export async function POST(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth();
  if (error) return error;

  const { type, detail } = await req.json();

  const streak = await prisma.streak.findFirst({
    where: { userId: session!.user.id, active: true },
  });

  if (!streak) {
    return NextResponse.json({ error: "No active streak" }, { status: 404 });
  }

  await prisma.weakness.create({
    data: {
      streakId: streak.id,
      type,
      detail: detail ?? null,
    },
  });

  // Hardcore mode: any weakness breaks the streak
  if (streak.hardcore) {
    await prisma.streak.update({
      where: { id: streak.id },
      data: { active: false, endedAt: new Date() },
    });

    await logFeedEvent(
      streak.id,
      session!.user.id,
      "surrender",
      streak.trackName,
      streak.trackArtist,
      `Hardcore streak broken by ${type} after ${streak.count} plays`
    );

    return NextResponse.json({ broken: true, reason: type, count: streak.count });
  }

  return NextResponse.json({ broken: false });
}

export async function GET() {
  const { session, error } = await getSessionOrUnauth();
  if (error) return error;

  const streak = await prisma.streak.findFirst({
    where: { userId: session!.user.id, active: true },
  });

  if (!streak) {
    return NextResponse.json([]);
  }

  const weaknesses = await prisma.weakness.findMany({
    where: { streakId: streak.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(
    weaknesses.map((w) => ({
      id: w.id,
      type: w.type,
      detail: w.detail,
      createdAt: w.createdAt.toISOString(),
    }))
  );
}
