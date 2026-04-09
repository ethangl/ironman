import { getServerConvexClient } from "@/lib/convex-server";
import { api } from "../../convex/_generated/api";

export async function logFeedEvent(
  streakId: string,
  userId: string,
  userName: string | null,
  userImage: string | null,
  type: "lock_in" | "surrender",
  trackName: string,
  trackArtist: string,
  detail?: string,
) {
  const convex = getServerConvexClient();
  if (!convex) return;

  const createdAt = Date.now();

  try {
    await convex.mutation(api.feed.logEvent, {
      sourceId: crypto.randomUUID(),
      streakId,
      userId,
      type,
      trackName,
      trackArtist,
      detail,
      userName: userName ?? undefined,
      userImage: userImage ?? undefined,
      createdAt,
    });
  } catch (error) {
    console.error("[feed] failed to write feed event to Convex", error);
  }
}
