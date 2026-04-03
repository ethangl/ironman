import { NextRequest, NextResponse } from "next/server";
import { getSessionOrUnauth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { detectCompletion } from "@/lib/streak";
import { justHitMilestone } from "@/lib/milestones";
import { logFeedEvent } from "@/lib/feed";

export async function POST(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth();
  if (error) return error;

  const { progress_ms, track_id, is_playing } = await req.json();

  const streak = await prisma.streak.findFirst({
    where: { userId: session!.user.id, active: true },
  });

  if (!streak) {
    return NextResponse.json({ error: "no_active_streak" }, { status: 404 });
  }

  if (track_id !== streak.trackId) {
    return NextResponse.json({
      count: streak.count,
      active: true,
      enforceNeeded: true,
    });
  }

  let newCount = streak.count;

  if (
    detectCompletion(
      streak.lastProgressMs,
      progress_ms,
      streak.trackDuration,
      is_playing
    )
  ) {
    newCount += 1;

    // Check if a milestone was just hit
    const milestone = justHitMilestone(streak.count, newCount);
    if (milestone) {
      await logFeedEvent(
        streak.id,
        session!.user.id,
        "milestone",
        streak.trackName,
        streak.trackArtist,
        `${milestone.badge} ${milestone.label} (${milestone.threshold} plays)`
      );
    }
  }

  await prisma.streak.update({
    where: { id: streak.id },
    data: {
      count: newCount,
      lastProgressMs: progress_ms,
      lastCheckedAt: new Date(),
    },
  });

  return NextResponse.json({
    count: newCount,
    active: true,
    enforceNeeded: false,
  });
}
