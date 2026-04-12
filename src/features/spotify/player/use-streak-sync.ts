import { useCallback, useEffect, useRef } from "react";

import type { StreakData } from "@/types";

const STREAK_CHANNEL_NAME = "ironman-streak";

type StreakSyncMessage = {
  type: "streak_state";
  source: string;
  streak: StreakData | null;
};

export function useStreakSync({
  applyStreakState,
  getStatus,
  hasSession,
}: {
  applyStreakState: (nextStreak: StreakData | null) => void;
  getStatus: () => Promise<StreakData | null>;
  hasSession: boolean;
}) {
  const streakChannelRef = useRef<BroadcastChannel | null>(null);
  const syncSourceRef = useRef<string | null>(null);

  const getSyncSource = useCallback(() => {
    if (!syncSourceRef.current) {
      syncSourceRef.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `streak-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }

    return syncSourceRef.current;
  }, []);

  const broadcastStreakState = useCallback(
    (nextStreak: StreakData | null) => {
      streakChannelRef.current?.postMessage({
        type: "streak_state",
        source: getSyncSource(),
        streak: nextStreak,
      } satisfies StreakSyncMessage);
    },
    [getSyncSource],
  );

  useEffect(() => {
    if (!hasSession) {
      queueMicrotask(() => applyStreakState(null));
      return;
    }

    let cancelled = false;

    const syncFromServer = async () => {
      try {
        const data = await getStatus();
        if (!cancelled) {
          applyStreakState(data);
        }
      } catch {
        // Ignore background sync failures and keep local player state intact.
      }
    };

    void syncFromServer();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void syncFromServer();
      }
    };

    window.addEventListener("focus", syncFromServer);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", syncFromServer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [applyStreakState, getStatus, hasSession]);

  useEffect(() => {
    if (!hasSession || typeof BroadcastChannel === "undefined") {
      return;
    }

    const channel = new BroadcastChannel(STREAK_CHANNEL_NAME);
    streakChannelRef.current = channel;

    const handleMessage = (event: MessageEvent<StreakSyncMessage>) => {
      const message = event.data;
      if (
        !message ||
        message.type !== "streak_state" ||
        message.source === getSyncSource()
      ) {
        return;
      }

      applyStreakState(message.streak);
    };

    channel.addEventListener("message", handleMessage);

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
      if (streakChannelRef.current === channel) {
        streakChannelRef.current = null;
      }
    };
  }, [applyStreakState, getSyncSource, hasSession]);

  return { broadcastStreakState };
}
