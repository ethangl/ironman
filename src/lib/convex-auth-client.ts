import {
  convexClient,
  crossDomainClient,
} from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { getConvexSiteUrl } from "@/lib/convex-env";

export const convexAuthClient = createAuthClient({
  baseURL: getConvexSiteUrl("Convex Better Auth"),
  plugins: [convexClient(), crossDomainClient()],
});

export const {
  signIn: convexSignIn,
  signOut: convexSignOut,
  useSession: useConvexSession,
} = convexAuthClient;
