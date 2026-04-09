import { createAuthClient } from "better-auth/react";
import { convexClient, crossDomainClient } from "@convex-dev/better-auth/client/plugins";

function getConvexAuthBaseUrl() {
  const url =
    import.meta.env.CONVEX_SITE_URL ??
    process.env.CONVEX_SITE_URL ??
    (process.env.NODE_ENV === "test" ? "http://127.0.0.1:3210" : undefined);
  if (!url) {
    throw new Error("Missing CONVEX_SITE_URL for Convex Better Auth.");
  }

  return url;
}

export const convexAuthClient = createAuthClient({
  baseURL: getConvexAuthBaseUrl(),
  plugins: [convexClient(), crossDomainClient()],
});

export const {
  signIn: convexSignIn,
  signOut: convexSignOut,
  useSession: useConvexSession,
} = convexAuthClient;
