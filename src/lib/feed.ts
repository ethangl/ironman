import { prisma } from "@/lib/prisma";

export async function logFeedEvent(
  streakId: string,
  userId: string,
  type: "lock_in" | "surrender",
  trackName: string,
  trackArtist: string,
  detail?: string
) {
  await prisma.feedEvent.create({
    data: {
      streakId,
      userId,
      type,
      trackName,
      trackArtist,
      detail: detail ?? null,
    },
  });
}
