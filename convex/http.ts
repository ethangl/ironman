import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

import { internal } from "./_generated/api";
import { authComponent, createAuth } from "./betterAuth";

const http = httpRouter();
const SPOTIFY_AUTH_COOLDOWN_KEY = "spotify-auth-cooldown";

authComponent.registerRoutes(http, createAuth, { cors: true });

http.route({
  path: "/api/spotify-auth/cooldown",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const entry = await ctx.runQuery(internal.spotifyAuthCooldown.get, {
      key: SPOTIFY_AUTH_COOLDOWN_KEY,
    });

    if (!entry) {
      return Response.json({
        cooldownUntil: null,
        retryAfterSeconds: null,
      });
    }

    return Response.json({
      cooldownUntil: entry.expiresAt,
      retryAfterSeconds: Math.max(
        entry.retryAfterSeconds,
        Math.ceil((entry.expiresAt - Date.now()) / 1000),
        0,
      ),
    });
  }),
});

export default http;
