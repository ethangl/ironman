import { afterEach, describe, expect, it, vi } from "vitest";

type RegisteredAction = {
  _handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error?: unknown) => void;
  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return { promise, resolve, reject };
}

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), init);
}

function runAction<TArgs, TResult>(
  registeredAction: RegisteredAction,
  ctx: unknown,
  args: TArgs,
): Promise<TResult> {
  return registeredAction._handler(ctx, args) as Promise<TResult>;
}

async function loadSpotifyModules({
  accessToken = "spotify-token",
  accessTokenExpiresAt = Date.now() + 5 * 60 * 1000,
  getAccessTokenImpl,
}: {
  accessToken?: string;
  accessTokenExpiresAt?: number;
  getAccessTokenImpl?: () => Promise<{
    accessToken?: string | null;
    accessTokenExpiresAt?: number | null;
  }>;
} = {}) {
  vi.resetModules();

  const getAuthUser = vi.fn().mockResolvedValue({ _id: "user-1" });
  const getAccessToken = vi.fn(
    getAccessTokenImpl ??
      (() =>
        Promise.resolve({
          accessToken,
          accessTokenExpiresAt,
        })),
  );
  const getAuth = vi.fn().mockResolvedValue({
    auth: {
      api: {
        getAccessToken,
      },
    },
    headers: new Headers(),
  });

  vi.doMock("./betterAuth", () => ({
    authComponent: {
      getAuthUser,
      getAuth,
    },
    createAuth: vi.fn(),
  }));

  const spotifyModule = await import("./spotify");
  const artistsModule = await import("./spotify/artists");
  const searchModule = await import("./spotify/search");
  const tracksModule = await import("./spotify/tracks");

  return {
    spotifyModule,
    artistsModule,
    searchModule,
    tracksModule,
    getAuth,
    getAccessToken,
  };
}

describe("convex/spotify auth handoff", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it("dedupes concurrent provider token lookups across loaders", async () => {
    const deferred = createDeferred<{
      accessToken?: string | null;
      accessTokenExpiresAt?: number | null;
    }>();
    const { searchModule, getAuth, getAccessToken } =
      await loadSpotifyModules({
        getAccessTokenImpl: () => deferred.promise,
      });
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        jsonResponse({
          tracks: { items: [] },
          artists: { items: [] },
          playlists: { items: [] },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const first = runAction(
      searchModule.loadSearchResults as unknown as RegisteredAction,
      {},
      { query: "isis" },
    );
    const second = runAction(
      searchModule.loadSearchTracks as unknown as RegisteredAction,
      {},
      { query: "weight" },
    );

    deferred.resolve({
      accessToken: "spotify-token",
      accessTokenExpiresAt: Date.now() + 5 * 60 * 1000,
    });

    await Promise.all([first, second]);

    expect(getAuth).toHaveBeenCalledTimes(1);
    expect(getAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("reuses a cached provider token for sequential loader actions until expiry", async () => {
    const { searchModule, tracksModule, getAuth, getAccessToken } =
      await loadSpotifyModules();
    const fetchMock = vi.fn((input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("/search?")) {
        return Promise.resolve(
          jsonResponse({
            tracks: { items: [] },
            artists: { items: [] },
            playlists: { items: [] },
          }),
        );
      }
      if (url.includes("/me/player/recently-played")) {
        return Promise.resolve(jsonResponse({ items: [] }));
      }
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });
    vi.stubGlobal("fetch", fetchMock);

    await runAction(
      searchModule.loadSearchResults as unknown as RegisteredAction,
      {},
      { query: "isis" },
    );
    await runAction(
      tracksModule.loadRecentlyPlayed as unknown as RegisteredAction,
      {},
      { limit: 30, cacheScope: "user-1" },
    );

    expect(getAuth).toHaveBeenCalledTimes(1);
    expect(getAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("uses the Spotify session token for playback writes", async () => {
    const { spotifyModule } = await loadSpotifyModules();
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      runAction(spotifyModule.playbackPause as unknown as RegisteredAction, {}, {}),
    ).resolves.toEqual({ ok: true, status: 204 });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.spotify.com/v1/me/player/pause",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          Authorization: "Bearer spotify-token",
        }),
      }),
    );
  });

  it("forwards playback offsets to Spotify without extra wrappers", async () => {
    const { spotifyModule } = await loadSpotifyModules();
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      runAction(spotifyModule.playbackPlay as unknown as RegisteredAction, {}, {
        uri: "spotify:track:track-1",
        deviceId: "device-1",
        offsetMs: 12_345,
      }),
    ).resolves.toEqual({ ok: true, status: 204 });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.spotify.com/v1/me/player/play?device_id=device-1",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          Authorization: "Bearer spotify-token",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          uris: ["spotify:track:track-1"],
          position_ms: 12_345,
        }),
      }),
    );
  });
});
