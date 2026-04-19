type AuthModule = typeof import("@/lib/convex-auth-client");

type SessionState = ReturnType<AuthModule["useConvexSession"]>;
export type SessionData = SessionState["data"];
export type SpotifyConnection = "unknown" | "connected" | "disconnected";

export interface AppAuthRuntime {
  session: SessionData;
  isPending: boolean;
  isAuthenticated: boolean;
  signIn: AuthModule["convexSignIn"];
  signOut: AuthModule["convexSignOut"];
  getSpotifyAccessToken: () => Promise<string | null>;
}

export interface SpotifyStatus {
  code: "signed_out" | "checking" | "connected" | "reconnect_required";
  title: string;
  description: string;
  actionLabel: string | null;
}

export interface AppCapabilities {
  hasSession: boolean;
  spotifyConnection: SpotifyConnection;
  spotifyStatus: SpotifyStatus;
  canBrowsePersonalSpotify: boolean;
  canControlPlayback: boolean;
}

export interface AppRuntime {
  auth: AppAuthRuntime;
  capabilities: AppCapabilities;
}
