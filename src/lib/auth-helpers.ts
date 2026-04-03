import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function getSessionOrUnauth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { session, error: null };
}

export async function getSpotifyToken(userId: string) {
  // Better Auth stores tokens in the account table and auto-refreshes
  const token = await auth.api.getAccessToken({
    body: { providerId: "spotify" },
    headers: await headers(),
  });
  return token?.accessToken ?? null;
}
