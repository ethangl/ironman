import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import path from "node:path";

const dbPath = path.join(process.cwd(), "dev.db");
const SPOTIFY_PROFILE_RETRY_LIMIT = 2;
const SPOTIFY_PROFILE_RETRY_DELAY_MS = 15_000;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchSpotifyProfile(accessToken: string) {
  for (let attempt = 1; attempt <= SPOTIFY_PROFILE_RETRY_LIMIT; attempt++) {
    const res = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const text = await res.text();
    console.log("[auth] Spotify /me response:", res.status, text.substring(0, 200));

    if (res.ok) {
      return text ? JSON.parse(text) : null;
    }

    if (res.status !== 429 || attempt === SPOTIFY_PROFILE_RETRY_LIMIT) {
      return null;
    }

    console.warn(
      `[auth] Spotify /me rate limited, retrying in ${SPOTIFY_PROFILE_RETRY_DELAY_MS}ms (attempt ${attempt}/${SPOTIFY_PROFILE_RETRY_LIMIT})`,
    );
    await delay(SPOTIFY_PROFILE_RETRY_DELAY_MS);
  }

  return null;
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: new Database(dbPath),
  socialProviders: {
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
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
