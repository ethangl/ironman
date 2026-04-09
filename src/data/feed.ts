import { requestJson } from "@/data/http";

export interface FeedItem {
  id: string;
  type: string;
  detail: string | null;
  trackName: string;
  trackArtist: string;
  userName: string | null;
  userImage: string | null;
  createdAt: string;
}

export function getFeedItems() {
  return requestJson<FeedItem[]>(
    "/api/feed",
    undefined,
    "Could not load live feed.",
  );
}
