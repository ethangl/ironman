import { NextResponse } from "next/server";

import { SpotifyApiError } from "@/lib/spotify";

export interface SpotifyRouteErrorPayload {
  code:
    | "spotify_auth"
    | "spotify_forbidden"
    | "spotify_rate_limited"
    | "spotify_upstream_error";
  message: string;
  retryAfterSeconds?: number | null;
  status: number;
}

export function createSpotifyRouteErrorResponse(
  error: unknown,
  fallbackMessage: string,
) {
  if (!(error instanceof SpotifyApiError)) {
    return NextResponse.json(
      {
        error: {
          code: "spotify_upstream_error",
          message: fallbackMessage,
          status: 502,
        } satisfies SpotifyRouteErrorPayload,
      },
      { status: 502 },
    );
  }

  const payload: SpotifyRouteErrorPayload = {
    code:
      error.status === 401
        ? "spotify_auth"
        : error.status === 403
          ? "spotify_forbidden"
          : error.status === 429
            ? "spotify_rate_limited"
            : "spotify_upstream_error",
    message: fallbackMessage,
    retryAfterSeconds: error.retryAfterSeconds,
    status: error.status,
  };

  return NextResponse.json(
    { error: payload },
    {
      status: error.status,
      headers:
        error.retryAfterSeconds && error.status === 429
          ? { "retry-after": String(error.retryAfterSeconds) }
          : undefined,
    },
  );
}
