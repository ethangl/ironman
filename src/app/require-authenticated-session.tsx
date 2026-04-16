import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAppAuth } from "./app-runtime";
import { AuthPendingState } from "./auth-pending-state";

export function RequireAuthenticatedSession() {
  const { isAuthenticated, isPending } = useAppAuth();
  const location = useLocation();

  if (isPending) {
    return (
      <AuthPendingState
        title="Loading your app session"
        description="We’re checking whether your Spotify session is ready before we open the signed-in app."
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={{
          pathname: "/",
          search: location.search,
        }}
        replace
      />
    );
  }

  return <Outlet />;
}
