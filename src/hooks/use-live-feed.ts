import { useQuery } from "convex/react";

import { FeedItem } from "@/types/feed";
import { api } from "../../convex/_generated/api";

export function useLiveFeed() {
  const items = useQuery(api.feed.list) as FeedItem[] | undefined;

  return { items: items ?? [], loading: items === undefined };
}
