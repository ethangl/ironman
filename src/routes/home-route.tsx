import { Navigate, useLocation } from "react-router-dom";

import { AuthPendingState, useAppAuth } from "@/app";
import { LoginButton } from "@/features/auth";

export function HomeRoute() {
  const { isAuthenticated, isPending } = useAppAuth();
  const location = useLocation();

  if (isPending) {
    return (
      <AuthPendingState
        title="Checking your session"
        description="We’re figuring out whether to open the public home page or send you into the signed-in app."
      />
    );
  }

  if (isAuthenticated) {
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

  return (
    <div className="flex h-dvh items-center justify-center w-dvw">
      <LoginButton />
    </div>
  );
}
