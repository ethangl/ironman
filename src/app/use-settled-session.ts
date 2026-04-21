import { useConvexSession } from "@/lib/convex-auth-client";
import { useEffect, useState } from "react";

type SessionData = ReturnType<typeof useConvexSession>["data"];

const SESSION_SETTLE_DELAY_MS = 400;

export function useSettledSession() {
  const { data: session, isPending } = useConvexSession();
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
