import { useEffect } from "react";

const RECENT_POLL_MS = 30_000;

export function useSpotifyRecentPolling({
  enabled,
  refreshRecent,
}: {
  enabled: boolean;
  refreshRecent: () => Promise<void>;
}) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const pollIfVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshRecent();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshRecent();
      }
    };

    const interval = window.setInterval(pollIfVisible, RECENT_POLL_MS);
    window.addEventListener("focus", pollIfVisible);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", pollIfVisible);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled, refreshRecent]);
}
