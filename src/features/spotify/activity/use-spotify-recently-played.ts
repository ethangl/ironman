import { useCallback, useEffect, useRef, useState } from "react";

import {
  RECENTLY_PLAYED_LIMIT,
  spotifyActivityClient,
} from "@/features/spotify/client";
import type { SpotifyTrack } from "@/types";
import type { RecentTrack } from "@/types/spotify-activity";

function dedupeRecent(raw: RecentTrack[]) {
  const seen = new Set<string>();
  const deduped: RecentTrack[] = [];

  for (const item of raw) {
    if (seen.has(item.track.id)) {
      continue;
    }

    seen.add(item.track.id);
    deduped.push(item);

    if (deduped.length >= RECENTLY_PLAYED_LIMIT) {
      break;
    }
  }

  return deduped;
}

export function useSpotifyRecentlyPlayed({
  canBrowsePersonalSpotify,
}: {
  canBrowsePersonalSpotify: boolean;
}) {
  const requestVersionRef = useRef(0);
  const [recentTracks, setRecentTracks] = useState<RecentTrack[]>([]);
  const [recentTracksLoading, setRecentTracksLoading] = useState(
    canBrowsePersonalSpotify,
  );
  const [recentTracksRefreshing, setRecentTracksRefreshing] = useState(false);

  const appendRecentTrack = useCallback((track: SpotifyTrack) => {
    const nextItem: RecentTrack = {
      playedAt: new Date().toISOString(),
      track,
    };
    setRecentTracks((current) => dedupeRecent([nextItem, ...current]));
  }, []);

  const loadRecentlyPlayed = useCallback(
    async (mode: "load" | "refresh") => {
      if (!canBrowsePersonalSpotify) {
        return;
      }

      const requestVersion = ++requestVersionRef.current;
      if (mode === "refresh") {
        setRecentTracksRefreshing(true);
      } else {
        setRecentTracksLoading(true);
        setRecentTracksRefreshing(false);
      }

      try {
        const recentlyPlayed = await spotifyActivityClient.getRecentlyPlayed();
        if (requestVersionRef.current !== requestVersion) {
          return;
        }

        if (!recentlyPlayed.rateLimited) {
          setRecentTracks(dedupeRecent(recentlyPlayed.items));
        }
      } catch {
        if (requestVersionRef.current !== requestVersion) {
          return;
        }
      } finally {
        if (requestVersionRef.current === requestVersion) {
          setRecentTracksLoading(false);
          setRecentTracksRefreshing(false);
        }
      }
    },
    [canBrowsePersonalSpotify],
  );

  useEffect(() => {
    if (!canBrowsePersonalSpotify) {
      requestVersionRef.current += 1;
      setRecentTracks([]);
      setRecentTracksLoading(false);
      setRecentTracksRefreshing(false);
      return;
    }

    void loadRecentlyPlayed("load");
  }, [canBrowsePersonalSpotify, loadRecentlyPlayed]);

  const refresh = useCallback(() => {
    if (!canBrowsePersonalSpotify) {
      requestVersionRef.current += 1;
      setRecentTracks([]);
      setRecentTracksLoading(false);
      setRecentTracksRefreshing(false);
      return;
    }

    void loadRecentlyPlayed("refresh");
  }, [canBrowsePersonalSpotify, loadRecentlyPlayed]);

  return {
    appendRecentTrack,
    loading: recentTracksLoading || recentTracksRefreshing,
    recentTracks,
    refresh,
  };
}
