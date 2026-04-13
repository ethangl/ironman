import { useEffect, useState } from "react";

import type { SessionData } from "./app-runtime-types";

const SESSION_SETTLE_DELAY_MS = 400;

export function useSettledSession({
  isPending,
  session,
}: {
  isPending: boolean;
  session: SessionData;
}) {
  const [lastResolvedSession, setLastResolvedSession] =
    useState<SessionData>(session);
  const [isSessionSettled, setIsSessionSettled] = useState(() => !!session);

  useEffect(() => {
    if (session) {
      setIsSessionSettled(true);
      setLastResolvedSession(session);
      return;
    }

    if (isPending) {
      setIsSessionSettled(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setLastResolvedSession(null);
      setIsSessionSettled(true);
    }, SESSION_SETTLE_DELAY_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isPending, session]);

  return {
    effectiveSession: session ?? (!isSessionSettled ? lastResolvedSession : null),
    isSessionPending: isPending || !isSessionSettled,
  };
}
