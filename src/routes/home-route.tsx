import { Navigate, useLocation } from "react-router-dom";

import { useAppAuth } from "@/app/app-runtime";
import { AuthPendingState } from "@/app/auth-pending-state";
import { LoginButton } from "@/features/auth";

export function HomeRoute() {
  const { isPending, session } = useAppAuth();
  const location = useLocation();

  if (isPending) {
    return (
      <AuthPendingState
        title="Checking your session"
        description="We’re figuring out whether to open the public home page or send you into the signed-in app."
      />
    );
  }

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

  return (
    <div className="flex h-dvh items-center justify-center w-dvw">
      <LoginButton />
    </div>
  );
}
