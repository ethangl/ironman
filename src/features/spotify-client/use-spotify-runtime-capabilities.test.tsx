import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  clearSpotifyAuthFailure,
  reportSpotifyAuthFailure,
} from "./spotify-auth-status";
import { useSpotifyRuntimeCapabilities } from "./use-spotify-runtime-capabilities";

vi.mock("./spotify-account-link", () => ({
  hasCachedSpotifyAccountLink: vi.fn(async () => true),
  clearCachedSpotifyAccountLink: vi.fn(),
}));
vi.mock("./spotify-access-token", () => ({
  getCachedSpotifyAccessToken: vi.fn(async () => "token"),
  clearCachedSpotifyAccessToken: vi.fn(),
}));

afterEach(() => {
  clearSpotifyAuthFailure();
});

describe("useSpotifyRuntimeCapabilities", () => {
  it("flips spotifyConnection to disconnected on a reported auth failure", async () => {
    const { result } = renderHook(() =>
      useSpotifyRuntimeCapabilities("user-1"),
    );

    // A linked account starts out connected...
    await waitFor(() =>
      expect(result.current.spotifyConnection).toBe("connected"),
    );

    // ...a dead-token report flips the whole app to the reconnect gate...
    act(() => {
      reportSpotifyAuthFailure();
    });
    expect(result.current.spotifyConnection).toBe("disconnected");
    expect(result.current.canControlPlayback).toBe(false);

    // ...and a successful action (or reconnect) clears it.
    act(() => {
      clearSpotifyAuthFailure();
    });
    expect(result.current.spotifyConnection).toBe("connected");
  });
});
