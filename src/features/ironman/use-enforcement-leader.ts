import { useCallback, useEffect, useRef, type MutableRefObject } from "react";

import {
  LEADER_HEARTBEAT_MS,
  LEADER_KEY,
  LEADER_TTL_MS,
  POLL_INTERVAL,
  logEnforcement,
} from "./enforcement-runtime";

export function useEnforcementLeader({
  enforceRef,
}: {
  enforceRef: MutableRefObject<() => Promise<void>>;
}) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const leaderHeartbeatRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const tabIdRef = useRef<string | null>(null);
  const isLeaderRef = useRef(false);

  const getTabId = useCallback(() => {
    if (!tabIdRef.current) {
      tabIdRef.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
    return tabIdRef.current;
  }, []);

  const readLeader = useCallback(() => {
    try {
      const raw = window.localStorage.getItem(LEADER_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as { tabId: string; ts: number };
    } catch {
      return null;
    }
  }, []);

  const writeLeader = useCallback(() => {
    const entry = JSON.stringify({
      tabId: getTabId(),
      ts: Date.now(),
    });
    window.localStorage.setItem(LEADER_KEY, entry);
    isLeaderRef.current = true;
    logEnforcement("leader heartbeat/write", { tabId: getTabId() });
  }, [getTabId]);

  const releaseLeader = useCallback(() => {
    const current = readLeader();
    if (current?.tabId === tabIdRef.current) {
      window.localStorage.removeItem(LEADER_KEY);
      logEnforcement("leader released", { tabId: tabIdRef.current });
    }
    isLeaderRef.current = false;
  }, [readLeader]);

  const tryBecomeLeader = useCallback(() => {
    if (document.visibilityState !== "visible") {
      logEnforcement("leader skipped: hidden tab");
      releaseLeader();
      return false;
    }

    const current = readLeader();
    const expired = !current || Date.now() - current.ts > LEADER_TTL_MS;
    const isCurrentLeader = current?.tabId === getTabId();

    if (expired || isCurrentLeader) {
      writeLeader();
      logEnforcement("leader active", {
        tabId: getTabId(),
        reason: expired ? "expired-or-empty" : "already-leader",
      });
      return true;
    }

    isLeaderRef.current = false;
    logEnforcement("leader follower", {
      tabId: getTabId(),
      leaderTabId: current?.tabId,
    });
    return false;
  }, [getTabId, readLeader, releaseLeader, writeLeader]);

  const canEnforceNow = useCallback(() => {
    if (document.visibilityState !== "visible") {
      return false;
    }

    return isLeaderRef.current || tryBecomeLeader();
  }, [tryBecomeLeader]);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (leaderHeartbeatRef.current) {
      clearInterval(leaderHeartbeatRef.current);
      leaderHeartbeatRef.current = null;
    }
    releaseLeader();
  }, [releaseLeader]);

  useEffect(() => {
    if (tryBecomeLeader()) {
      logEnforcement("initial enforcement run");
      void enforceRef.current();
    }

    intervalRef.current = setInterval(() => {
      if (document.visibilityState !== "visible") {
        logEnforcement("interval skipped: hidden tab");
        return;
      }

      if (isLeaderRef.current || tryBecomeLeader()) {
        void enforceRef.current();
      } else {
        logEnforcement("interval skipped: follower tab");
      }
    }, POLL_INTERVAL);

    leaderHeartbeatRef.current = setInterval(() => {
      if (document.visibilityState !== "visible") {
        logEnforcement("heartbeat skipped: hidden tab");
        releaseLeader();
        return;
      }

      if (isLeaderRef.current) {
        writeLeader();
      } else {
        tryBecomeLeader();
      }
    }, LEADER_HEARTBEAT_MS);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        logEnforcement("visibility: visible");
        if (tryBecomeLeader()) {
          void enforceRef.current();
        }
      } else {
        logEnforcement("visibility: hidden");
        releaseLeader();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== LEADER_KEY) return;
      const current = readLeader();
      isLeaderRef.current = current?.tabId === tabIdRef.current;
      logEnforcement("storage leader update", {
        leaderTabId: current?.tabId ?? null,
        tabId: tabIdRef.current,
        isLeader: isLeaderRef.current,
      });
      if (!current && document.visibilityState === "visible") {
        tryBecomeLeader();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("pagehide", releaseLeader);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("pagehide", releaseLeader);
      stopMonitoring();
    };
  }, [enforceRef, readLeader, releaseLeader, stopMonitoring, tryBecomeLeader, writeLeader]);

  return {
    canEnforceNow,
    stopMonitoring,
  };
}
