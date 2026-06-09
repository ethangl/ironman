import { Navigate, useLocation } from "react-router-dom";

import { useAppAuth } from "@/app/app-runtime";
import { AuthPendingState } from "@/app/auth-pending-state";

export function HomeRoute() {
  const { isPending, session } = useAppAuth();
  const location = useLocation();

  if (session) {
    return (
      <Navigate
        to={{
          pathname: "/home",
          search: location.search,
        }}
        replace
      />
    );
  }

  // No session yet: AppRuntimeProvider is silently creating an anonymous guest
  // session (guest-default — no login wall), so this is a brief transient state.
  return (
    <AuthPendingState
      title={isPending ? "Checking your session" : "Setting things up"}
      description="Getting you into viibes."
    />
  );
}
