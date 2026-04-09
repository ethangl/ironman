import { betterAuth } from "better-auth";
import { createClient } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";

import authConfig from "./auth.config";
import { components } from "./_generated/api";

type GeneratedComponents = typeof import("./_generated/api").components;

const SPOTIFY_PROFILE_RETRY_LIMIT = 2;
const SPOTIFY_PROFILE_RETRY_DELAY_MS = 15_000;

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} for Convex Better Auth.`);
  }

  return value;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchSpotifyProfile(accessToken: string) {
  for (let attempt = 1; attempt <= SPOTIFY_PROFILE_RETRY_LIMIT; attempt++) {
    const res = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const text = await res.text();

    if (res.ok) {
      return text ? JSON.parse(text) : null;
    }

    if (res.status !== 429 || attempt === SPOTIFY_PROFILE_RETRY_LIMIT) {
      return null;
    }

    await delay(SPOTIFY_PROFILE_RETRY_DELAY_MS);
  }

  return null;
}

export const authComponent = createClient(
  (components as GeneratedComponents).betterAuth,
);

export const createAuth = (ctx: Parameters<typeof authComponent.adapter>[0]) =>
  betterAuth({
    secret: requireEnv("BETTER_AUTH_SECRET"),
    baseURL: requireEnv("CONVEX_SITE_URL"),
    database: authComponent.adapter(ctx),
    trustedOrigins: [requireEnv("SITE_URL")],
    plugins: [
      crossDomain({ siteUrl: requireEnv("SITE_URL") }),
      convex({ authConfig }),
    ],
    socialProviders: {
      spotify: {
        clientId: requireEnv("SPOTIFY_CLIENT_ID"),
        clientSecret: requireEnv("SPOTIFY_CLIENT_SECRET"),
        pkce: false,
        scope: [
          "user-read-email",
          "user-read-private",
          "user-top-read",
          "user-read-playback-state",
          "user-modify-playback-state",
          "user-read-recently-played",
          "playlist-read-private",
          "playlist-read-collaborative",
          "streaming",
        ],
        async getUserInfo(token) {
          if (!token.accessToken) return null;
          const profile = await fetchSpotifyProfile(token.accessToken);
          if (!profile) return null;

          return {
            user: {
              id: profile.id,
              name: profile.display_name || profile.id,
              email: profile.email,
              image: profile.images?.[0]?.url,
              emailVerified: false,
            },
            data: profile,
          };
        },
      },
    },
  });

export const { getAuthUser } = authComponent.clientApi();
