import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { RECENTLY_PLAYED_LIMIT } from "@/features/spotify-client";
import type {
  RecentTrack,
  SpotifyTrack,
} from "@/features/spotify-client/types";
import { api } from "@api";
import { getAuthenticatedSpotifyConvexClient } from "@/features/spotify-client/spotify-convex-client";

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

interface SpotifyRecentlyPlayedContextValue {
  appendRecentTrack: (track: SpotifyTrack) => void;
  loading: boolean;
  recentTracks: RecentTrack[];
  refresh: () => void;
}

export const SpotifyRecentlyPlayedContext =
  createContext<SpotifyRecentlyPlayedContextValue | null>(null);

export function useSpotifyRecentlyPlayedState(): SpotifyRecentlyPlayedContextValue {
  const requestVersionRef = useRef(0);
  const [recentTracks, setRecentTracks] = useState<RecentTrack[]>([]);
  const [recentTracksLoading, setRecentTracksLoading] = useState(true);
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
      const requestVersion = ++requestVersionRef.current;
      if (mode === "refresh") {
        setRecentTracksRefreshing(true);
      } else {
        setRecentTracksLoading(true);
        setRecentTracksRefreshing(false);
      }

      try {
        const client = await getAuthenticatedSpotifyConvexClient();
        const recentlyPlayed = await client.action(api.spotify.recentlyPlayed, {
          limit: RECENTLY_PLAYED_LIMIT,
        });
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
    [],
  );

  useEffect(() => {
    void loadRecentlyPlayed("load");
  }, [loadRecentlyPlayed]);

  const refresh = useCallback(() => {
    void loadRecentlyPlayed("refresh");
  }, [loadRecentlyPlayed]);

  return useMemo(
    () => ({
      appendRecentTrack,
      loading: recentTracksLoading || recentTracksRefreshing,
      recentTracks,
      refresh,
    }),
    [
      appendRecentTrack,
      recentTracksLoading,
      recentTracksRefreshing,
      recentTracks,
      refresh,
    ],
  );
}

export function useSpotifyRecentlyPlayed() {
  const ctx = useContext(SpotifyRecentlyPlayedContext);
  if (!ctx) {
    throw new Error(
      "useSpotifyRecentlyPlayed must be used within SpotifyActivityProvider",
    );
  }

  return ctx;
}
