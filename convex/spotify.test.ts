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
  const artistsLoaders = await import("./spotify/artistsLoaders");
  const searchLoaders = await import("./spotify/searchLoaders");
  const tracksLoaders = await import("./spotify/tracksLoaders");

  return {
    spotifyModule,
    artistsLoaders,
    searchLoaders,
    tracksLoaders,
    getAuth,
    getAccessToken,
  };
}

describe("convex/spotify auth handoff", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("dedupes concurrent provider token lookups across loaders", async () => {
    const deferred = createDeferred<{
      accessToken?: string | null;
      accessTokenExpiresAt?: number | null;
    }>();
    const { searchLoaders, getAuth, getAccessToken } =
      await loadSpotifyModules({
        getAccessTokenImpl: () => deferred.promise,
      });
    const ctx = {
      runAction: vi.fn().mockResolvedValue(null),
    };

    const first = runAction(
      searchLoaders.loadSearchResults as unknown as RegisteredAction,
      ctx,
      { query: "isis" },
    );
    const second = runAction(
      searchLoaders.loadSearchTracks as unknown as RegisteredAction,
      ctx,
      { query: "weight" },
    );

    deferred.resolve({
      accessToken: "spotify-token",
      accessTokenExpiresAt: Date.now() + 5 * 60 * 1000,
    });

    await Promise.all([first, second]);

    expect(getAuth).toHaveBeenCalledTimes(1);
    expect(getAccessToken).toHaveBeenCalledTimes(1);
    expect(ctx.runAction).toHaveBeenCalledTimes(2);
    expect(ctx.runAction).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      expect.objectContaining({ accessToken: "spotify-token" }),
    );
    expect(ctx.runAction).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      expect.objectContaining({ accessToken: "spotify-token" }),
    );
  });

  it("reuses a cached provider token for sequential loader actions until expiry", async () => {
    const { searchLoaders, tracksLoaders, getAuth, getAccessToken } =
      await loadSpotifyModules();
    const ctx = {
      runAction: vi.fn().mockResolvedValue(null),
    };

    await runAction(
      searchLoaders.loadSearchResults as unknown as RegisteredAction,
      ctx,
      { query: "isis" },
    );
    await runAction(
      tracksLoaders.loadRecentlyPlayed as unknown as RegisteredAction,
      ctx,
      { limit: 30, cacheScope: "user-1" },
    );

    expect(getAuth).toHaveBeenCalledTimes(1);
    expect(getAccessToken).toHaveBeenCalledTimes(1);
    expect(ctx.runAction).toHaveBeenCalledTimes(2);
  });

  it("forwards artist page loader requests with user cache scope", async () => {
    const { artistsLoaders } = await loadSpotifyModules();
    const ctx = {
      runAction: vi.fn().mockResolvedValue(null),
    };

    await runAction(
      artistsLoaders.loadArtistPage as unknown as RegisteredAction,
      ctx,
      {
        artistId: "artist-1",
        cacheScope: "user-1",
      },
    );

    expect(ctx.runAction).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        artistId: "artist-1",
        accessToken: "spotify-token",
        cacheScope: "user-1",
      }),
    );
  });

  it("forwards playback writes without adding extra request policy", async () => {
    const { spotifyModule } = await loadSpotifyModules();
    const ctx = {
      runAction: vi.fn().mockResolvedValue({ ok: true, status: 204 }),
    };

    await expect(
      runAction(spotifyModule.playbackPause as unknown as RegisteredAction, ctx, {}),
    ).resolves.toEqual({ ok: true, status: 204 });

    expect(ctx.runAction).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        accessToken: "spotify-token",
      }),
    );
  });

  it("forwards playback offsets to the spotify component action", async () => {
    const { spotifyModule } = await loadSpotifyModules();
    const ctx = {
      runAction: vi.fn().mockResolvedValue({ ok: true, status: 204 }),
    };

    await expect(
      runAction(spotifyModule.playbackPlay as unknown as RegisteredAction, ctx, {
        uri: "spotify:track:track-1",
        deviceId: "device-1",
        offsetMs: 12_345,
      }),
    ).resolves.toEqual({ ok: true, status: 204 });

    expect(ctx.runAction).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        accessToken: "spotify-token",
        uri: "spotify:track:track-1",
        deviceId: "device-1",
        offsetMs: 12_345,
      }),
    );
  });
});
