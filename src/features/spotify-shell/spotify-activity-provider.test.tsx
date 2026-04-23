import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  FAVORITE_ARTISTS_PAGE_SIZE,
  PLAYLIST_PAGE_SIZE,
  RECENTLY_PLAYED_LIMIT,
  type FavoriteArtistsPage,
  type PlaylistsPage,
} from "@/features/spotify-client";
import {
  useSpotifyFavoriteArtists,
  useSpotifyPlaylists,
  useSpotifyRecentlyPlayed,
} from "@/features/spotify-library";
import type {
  RecentlyPlayedPageResult,
  SpotifyTrack,
} from "@/features/spotify-client/types";
import { getAuthenticatedSpotifyConvexClient } from "@/features/spotify-client/spotify-convex-client";
import { getFunctionName } from "convex/server";
import { SpotifyActivityProvider } from "./spotify-activity-provider";

vi.mock("@/features/spotify-client/spotify-convex-client", () => ({
  getAuthenticatedSpotifyConvexClient: vi.fn(),
}));

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error?: unknown) => void;
  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return { promise, resolve, reject };
}

function playlist(id: string) {
  return {
    id,
    name: `Playlist ${id}`,
    description: null,
    image: null,
    owner: "ethan",
    public: true,
    trackCount: 1,
  };
}

function artist(id: string) {
  return {
    id: `artist-${id}`,
    name: `Artist ${id}`,
    image: null,
    followerCount: 100,
    genres: [],
  };
}

function recentTrack(
  id: string,
  options?: { playedAt?: string; trackId?: string },
) {
  return {
    playedAt:
      options?.playedAt ?? `2026-04-22T12:${id.padStart(2, "0")}:00.000Z`,
    track: {
      id: options?.trackId ?? `track-${id}`,
      name: `Track ${id}`,
      artist: `Artist ${id}`,
      albumImage: null,
      durationMs: 120000,
      albumName: `Album ${id}`,
    },
  };
}

function createRecentlyPlayedPage(
  items: Array<ReturnType<typeof recentTrack>>,
  nextCursor: number | null = null,
  total = items.length,
): RecentlyPlayedPageResult {
  return {
    page: {
      items,
      limit: RECENTLY_PLAYED_LIMIT,
      total,
      nextCursor,
      hasMore: nextCursor !== null,
    },
    rateLimited: false,
  };
}

function recentlyPlayedPage(
  ids: string[],
  nextCursor: number | null = null,
  total = ids.length,
): RecentlyPlayedPageResult {
  return createRecentlyPlayedPage(ids.map((id) => recentTrack(id)), nextCursor, total);
}

function createPlaylistsPage(
  items: Array<ReturnType<typeof playlist>>,
  nextOffset: number | null = null,
  total = items.length,
  offset = 0,
): PlaylistsPage {
  return {
    items,
    offset,
    limit: PLAYLIST_PAGE_SIZE,
    total,
    nextOffset,
    hasMore: nextOffset !== null,
  };
}

function createFavoriteArtistsPage(
  items: Array<ReturnType<typeof artist>>,
  nextCursor: string | null = null,
  total = items.length,
): FavoriteArtistsPage {
  return {
    items,
    limit: FAVORITE_ARTISTS_PAGE_SIZE,
    total,
    nextCursor,
    hasMore: nextCursor !== null,
  };
}

function ActivityConsumer() {
  const {
    loadMoreRecentTracks,
    recentTracks,
    recentTracksHasMore,
  } = useSpotifyRecentlyPlayed();
  const {
    favoriteArtists,
    favoriteArtistsHasMore,
    favoriteArtistsLoading,
    favoriteArtistsLoadingMore,
    loadFavoriteArtists,
    loadMoreFavoriteArtists,
  } = useSpotifyFavoriteArtists();
  const {
    playlists,
    playlistsHasMore,
    playlistsLoading,
    playlistsLoadingMore,
    loadPlaylists,
    loadMorePlaylists,
  } = useSpotifyPlaylists();

  return (
    <div>
      <div data-testid="playlist-count">{playlists.length}</div>
      <div data-testid="recent-count">{recentTracks.length}</div>
      <div data-testid="recent-ids">
        {recentTracks.map(({ track }) => track.id).join(",")}
      </div>
      <div data-testid="recent-has-more">{String(recentTracksHasMore)}</div>
      <div data-testid="favorite-artists-count">{favoriteArtists.length}</div>
      <div data-testid="favorite-artists-has-more">
        {String(favoriteArtistsHasMore)}
      </div>
      <div data-testid="playlists-loading">{String(playlistsLoading)}</div>
      <div data-testid="playlists-has-more">{String(playlistsHasMore)}</div>
      <div data-testid="playlists-loading-more">
        {String(playlistsLoadingMore)}
      </div>
      <div data-testid="favorite-artists-loading">
        {String(favoriteArtistsLoading)}
      </div>
      <div data-testid="favorite-artists-loading-more">
        {String(favoriteArtistsLoadingMore)}
      </div>
      {playlists.map((item) => (
        <div data-testid="playlist-name" key={item.id}>
          {item.name}
        </div>
      ))}
      {favoriteArtists.map((item) => (
        <div data-testid="favorite-artist-name" key={item.id}>
          {item.name}
        </div>
      ))}
      <button onClick={() => void loadPlaylists()}>Load playlists</button>
      <button onClick={() => void loadPlaylists(true)}>Refresh playlists</button>
      <button onClick={() => void loadMorePlaylists()}>Load more</button>
      <button onClick={() => void loadMoreRecentTracks()}>
        Load more recent tracks
      </button>
      <button onClick={() => void loadFavoriteArtists()}>Load favorite artists</button>
      <button onClick={() => void loadFavoriteArtists(true)}>
        Refresh favorite artists
      </button>
      <button onClick={() => void loadMoreFavoriteArtists()}>
        Load more favorite artists
      </button>
    </div>
  );
}

interface SpotifyActivityOverrides {
  getFavoriteArtists?: (
    limit?: number,
    after?: string,
    forceRefresh?: boolean,
  ) => Promise<FavoriteArtistsPage>;
  getRecentlyPlayed?: (
    limit?: number,
    before?: number,
    forceRefresh?: boolean,
  ) => Promise<RecentlyPlayedPageResult>;
  getPlaylistsPage?: (
    limit?: number,
    offset?: number,
    forceRefresh?: boolean,
  ) => Promise<PlaylistsPage>;
  getPlaylistTracks?: (playlistId: string) => Promise<SpotifyTrack[]>;
}

function renderProvider(overrides: SpotifyActivityOverrides = {}) {
  const getFavoriteArtists =
    overrides.getFavoriteArtists ??
    vi.fn().mockResolvedValue(createFavoriteArtistsPage([]));
  const getRecentlyPlayed =
    overrides.getRecentlyPlayed ??
    vi.fn().mockResolvedValue(recentlyPlayedPage([]));
  const getPlaylistsPage =
    overrides.getPlaylistsPage ??
    vi.fn().mockResolvedValue(createPlaylistsPage([]));
  const getPlaylistTracks =
    overrides.getPlaylistTracks ?? vi.fn().mockResolvedValue([]);

  const action = vi.fn((ref: unknown, args: unknown) => {
    const functionName = getFunctionName(ref as never);

    if (functionName === "spotify:favoriteArtists") {
      const { after, limit, forceRefresh } = args as {
        after?: string;
        limit: number;
        forceRefresh?: boolean;
      };
      return getFavoriteArtists(limit, after, forceRefresh);
    }

    if (functionName === "spotify:recentlyPlayed") {
      const { before, forceRefresh, limit } = args as {
        before?: number;
        forceRefresh?: boolean;
        limit: number;
      };
      return getRecentlyPlayed(limit, before, forceRefresh);
    }

    if (functionName === "spotify:playlistsPage") {
      const { limit, offset, forceRefresh } = args as {
        limit: number;
        offset: number;
        forceRefresh?: boolean;
      };
      return getPlaylistsPage(limit, offset, forceRefresh);
    }

    if (functionName === "spotify:playlistTracks") {
      return getPlaylistTracks((args as { playlistId: string }).playlistId);
    }

    throw new Error(`Unexpected Spotify action: ${functionName}`);
  });

  vi.mocked(getAuthenticatedSpotifyConvexClient).mockResolvedValue({
    action,
  } as never);

  return render(
    <>
      <SpotifyActivityProvider>
        <ActivityConsumer />
      </SpotifyActivityProvider>
    </>,
  );
}

describe("SpotifyActivityProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies a shared playlist page only once", async () => {
    const nextPage = createDeferred<PlaylistsPage>();
    const getPlaylistsPage = vi.fn((limit = PLAYLIST_PAGE_SIZE, offset = 0) => {
      if (limit !== PLAYLIST_PAGE_SIZE) {
        throw new Error(`Unexpected playlist page size: ${limit}`);
      }

      if (offset === 0) {
        return Promise.resolve(createPlaylistsPage([playlist("1")], 1, 2));
      }

      if (offset === 1) {
        return nextPage.promise;
      }

      throw new Error(`Unexpected playlist offset: ${offset}`);
    });

    renderProvider({
      getPlaylistsPage,
    });

    await waitFor(() => {
      expect(screen.getByTestId("playlist-count")).toHaveTextContent("1");
    });
    expect(screen.getByTestId("playlists-has-more")).toHaveTextContent("true");

    const loadMore = screen.getByRole("button", { name: "Load more" });
    fireEvent.click(loadMore);
    fireEvent.click(loadMore);

    await waitFor(() => {
      expect(getPlaylistsPage).toHaveBeenCalledTimes(2);
    });
    expect(getPlaylistsPage).toHaveBeenNthCalledWith(
      1,
      PLAYLIST_PAGE_SIZE,
      0,
      false,
    );
    expect(getPlaylistsPage).toHaveBeenNthCalledWith(
      2,
      PLAYLIST_PAGE_SIZE,
      1,
      undefined,
    );

    await act(async () => {
      nextPage.resolve(createPlaylistsPage([playlist("2")], null, 2, 1));
      await nextPage.promise;
    });

    await waitFor(() => {
      expect(screen.getByTestId("playlist-count")).toHaveTextContent("2");
    });

    expect(screen.getAllByTestId("playlist-name")).toHaveLength(2);
    expect(screen.getByText("Playlist 2")).toBeInTheDocument();
    expect(screen.getByTestId("playlists-has-more")).toHaveTextContent("false");
  });

  it("applies a shared recent tracks page only once and preserves duplicate plays", async () => {
    const nextPage = createDeferred<RecentlyPlayedPageResult>();
    const getRecentlyPlayed = vi.fn(
      (limit = RECENTLY_PLAYED_LIMIT, before?: number, forceRefresh = false) => {
        if (limit !== RECENTLY_PLAYED_LIMIT) {
          throw new Error(`Unexpected recent tracks page size: ${limit}`);
        }

        if (forceRefresh) {
          throw new Error("Recent tracks load more should not force refresh.");
        }

        if (before === undefined) {
          return Promise.resolve(
            createRecentlyPlayedPage(
              [
                recentTrack("1", {
                  playedAt: "2026-04-22T12:01:00.000Z",
                  trackId: "track-repeat",
                }),
              ],
              111,
              2,
            ),
          );
        }

        if (before === 111) {
          return nextPage.promise;
        }

        throw new Error(`Unexpected recent tracks cursor: ${before}`);
      },
    );

    renderProvider({
      getRecentlyPlayed,
    });

    await waitFor(() => {
      expect(screen.getByTestId("recent-count")).toHaveTextContent("1");
    });

    expect(screen.getByTestId("recent-has-more")).toHaveTextContent("true");

    const loadMoreRecentTracks = screen.getByRole("button", {
      name: "Load more recent tracks",
    });
    fireEvent.click(loadMoreRecentTracks);
    fireEvent.click(loadMoreRecentTracks);

    await waitFor(() => {
      expect(getRecentlyPlayed).toHaveBeenCalledTimes(2);
    });
    expect(getRecentlyPlayed).toHaveBeenNthCalledWith(
      1,
      RECENTLY_PLAYED_LIMIT,
      undefined,
      false,
    );
    expect(getRecentlyPlayed).toHaveBeenNthCalledWith(
      2,
      RECENTLY_PLAYED_LIMIT,
      111,
      false,
    );

    await act(async () => {
      nextPage.resolve(
        createRecentlyPlayedPage(
          [
            recentTrack("2", {
              playedAt: "2026-04-22T12:02:00.000Z",
              trackId: "track-repeat",
            }),
          ],
          null,
          2,
        ),
      );
      await nextPage.promise;
    });

    await waitFor(() => {
      expect(screen.getByTestId("recent-count")).toHaveTextContent("2");
    });

    expect(screen.getByTestId("recent-ids")).toHaveTextContent(
      "track-repeat,track-repeat",
    );
    expect(screen.getByTestId("recent-has-more")).toHaveTextContent("false");
  });

  it("loads playlists on mount", async () => {
    const getPlaylistsPage = vi
      .fn()
      .mockResolvedValue(createPlaylistsPage([playlist("1")]));

    renderProvider({
      getPlaylistsPage,
    });

    await waitFor(() => {
      expect(screen.getByTestId("playlist-count")).toHaveTextContent("1");
    });

    expect(getPlaylistsPage).toHaveBeenCalledTimes(1);
    expect(getPlaylistsPage).toHaveBeenCalledWith(
      PLAYLIST_PAGE_SIZE,
      0,
      false,
    );
  });

  it("refreshes playlists with force refresh", async () => {
    const getPlaylistsPage = vi
      .fn()
      .mockResolvedValueOnce(createPlaylistsPage([playlist("1")]))
      .mockResolvedValueOnce(createPlaylistsPage([playlist("2")]));

    renderProvider({
      getPlaylistsPage,
    });

    await waitFor(() => {
      expect(screen.getByTestId("playlist-count")).toHaveTextContent("1");
    });

    expect(getPlaylistsPage).toHaveBeenNthCalledWith(
      1,
      PLAYLIST_PAGE_SIZE,
      0,
      false,
    );

    fireEvent.click(screen.getByRole("button", { name: "Refresh playlists" }));

    await waitFor(() => {
      expect(screen.getByText("Playlist 2")).toBeInTheDocument();
    });
    expect(getPlaylistsPage).toHaveBeenNthCalledWith(
      2,
      PLAYLIST_PAGE_SIZE,
      0,
      true,
    );
  });

  it("applies a shared favorite artists page only once", async () => {
    const nextPage = createDeferred<FavoriteArtistsPage>();
    const getFavoriteArtists = vi.fn(
      (
        limit = FAVORITE_ARTISTS_PAGE_SIZE,
        after?: string,
        forceRefresh = false,
      ) => {
        if (limit !== FAVORITE_ARTISTS_PAGE_SIZE) {
          throw new Error(`Unexpected favorite artists page size: ${limit}`);
        }

        if (forceRefresh) {
          throw new Error("Favorite artists load more should not force refresh.");
        }

        if (after === undefined) {
          return Promise.resolve(
            createFavoriteArtistsPage([artist("1")], "artist-1", 2),
          );
        }

        if (after === "artist-1") {
          return nextPage.promise;
        }

        throw new Error(`Unexpected favorite artists cursor: ${after}`);
      },
    );

    renderProvider({
      getFavoriteArtists,
    });

    await waitFor(() => {
      expect(screen.getByTestId("favorite-artists-count")).toHaveTextContent(
        "1",
      );
    });
    expect(screen.getByTestId("favorite-artists-has-more")).toHaveTextContent(
      "true",
    );

    const loadMoreFavoriteArtists = screen.getByRole("button", {
      name: "Load more favorite artists",
    });
    fireEvent.click(loadMoreFavoriteArtists);
    fireEvent.click(loadMoreFavoriteArtists);

    await waitFor(() => {
      expect(getFavoriteArtists).toHaveBeenCalledTimes(2);
    });
    expect(getFavoriteArtists).toHaveBeenNthCalledWith(
      1,
      FAVORITE_ARTISTS_PAGE_SIZE,
      undefined,
      false,
    );
    expect(getFavoriteArtists).toHaveBeenNthCalledWith(
      2,
      FAVORITE_ARTISTS_PAGE_SIZE,
      "artist-1",
      undefined,
    );

    await act(async () => {
      nextPage.resolve(createFavoriteArtistsPage([artist("2")], null, 2));
      await nextPage.promise;
    });

    await waitFor(() => {
      expect(screen.getByTestId("favorite-artists-count")).toHaveTextContent(
        "2",
      );
    });

    expect(screen.getByText("Artist 2")).toBeInTheDocument();
    expect(screen.getByTestId("favorite-artists-has-more")).toHaveTextContent(
      "false",
    );
  });

  it("loads favorite artists on mount", async () => {
    const getFavoriteArtists = vi
      .fn()
      .mockResolvedValue(createFavoriteArtistsPage([artist("1")]));
    renderProvider({
      getFavoriteArtists,
    });

    await waitFor(() => {
      expect(screen.getByTestId("favorite-artists-count")).toHaveTextContent("1");
    });

    expect(getFavoriteArtists).toHaveBeenCalledTimes(1);
    expect(getFavoriteArtists).toHaveBeenCalledWith(
      FAVORITE_ARTISTS_PAGE_SIZE,
      undefined,
      false,
    );
  });

  it("refreshes favorite artists with force refresh", async () => {
    const getFavoriteArtists = vi
      .fn()
      .mockResolvedValueOnce(createFavoriteArtistsPage([artist("1")]))
      .mockResolvedValueOnce(createFavoriteArtistsPage([artist("2")]));

    renderProvider({
      getFavoriteArtists,
    });

    await waitFor(() => {
      expect(screen.getByTestId("favorite-artists-count")).toHaveTextContent("1");
    });

    expect(getFavoriteArtists).toHaveBeenNthCalledWith(
      1,
      FAVORITE_ARTISTS_PAGE_SIZE,
      undefined,
      false,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Refresh favorite artists" }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("favorite-artists-count")).toHaveTextContent("1");
    });
    expect(getFavoriteArtists).toHaveBeenNthCalledWith(
      2,
      FAVORITE_ARTISTS_PAGE_SIZE,
      undefined,
      true,
    );
  });

});
