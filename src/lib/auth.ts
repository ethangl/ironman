import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import path from "node:path";

const dbPath = path.join(process.cwd(), "dev.db");

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
        "user-read-playback-state",
        "user-modify-playback-state",
        "user-read-recently-played",
        "streaming",
      ],
      async getUserInfo(token) {
        const res = await fetch("https://api.spotify.com/v1/me", {
          headers: { Authorization: `Bearer ${token.accessToken}` },
        });
        const text = await res.text();
        console.log("[auth] Spotify /me response:", res.status, text.substring(0, 200));

        if (!res.ok) return null;

        const profile = JSON.parse(text);
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
