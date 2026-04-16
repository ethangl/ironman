import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

import { components } from "./_generated/api";
import { authComponent, createAuth } from "./betterAuth";

const http = httpRouter();
const SPOTIFY_AUTH_COOLDOWN_KEY = "spotify-auth-cooldown";

authComponent.registerRoutes(http, createAuth, { cors: true });

http.route({
  path: "/api/spotify-auth/cooldown",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const entry = await ctx.runQuery(components.spotify.cache.get, {
      key: SPOTIFY_AUTH_COOLDOWN_KEY,
    });

    if (!entry) {
      return Response.json({
        cooldownUntil: null,
        retryAfterSeconds: null,
      });
    }

    let retryAfterSeconds: number | null = null;
    try {
      const parsed = JSON.parse(entry.value) as { retryAfterSeconds?: unknown };
      if (
        typeof parsed.retryAfterSeconds === "number" &&
        Number.isFinite(parsed.retryAfterSeconds)
      ) {
        retryAfterSeconds = parsed.retryAfterSeconds;
      }
    } catch {
      retryAfterSeconds = null;
    }

    return Response.json({
      cooldownUntil: entry.expiresAt,
      retryAfterSeconds:
        retryAfterSeconds ??
        Math.max(Math.ceil((entry.expiresAt - Date.now()) / 1000), 0),
    });
  }),
});

export default http;
