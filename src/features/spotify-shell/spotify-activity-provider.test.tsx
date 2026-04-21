import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PLAYLIST_PAGE_SIZE, RECENTLY_PLAYED_LIMIT } from "@/features/spotify-client";
import {
  useSpotifyFavoriteArtists,
  useSpotifyPlaylists,
  useSpotifyRecentlyPlayed,
} from "@/features/spotify-library";
import type { SpotifyTrack } from "@/features/spotify-client/types";
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

function ActivityConsumer() {
  const { appendRecentTrack, recentTracks } = useSpotifyRecentlyPlayed();
  const {
    favoriteArtists,
    favoriteArtistsLoading,
    loadFavoriteArtists,
  } = useSpotifyFavoriteArtists();
  const {
    playlists,
    playlistsLoading,
    loadPlaylists,
    loadMorePlaylists,
  } = useSpotifyPlaylists();
  const sampleTrack: SpotifyTrack = {
    id: "track-1",
    name: "Track 1",
    artist: "Artist 1",
    albumImage: null,
    durationMs: 120000,
    albumName: "Album 1",
  };

  return (
    <div>
      <div data-testid="playlist-count">{playlists.length}</div>
      <div data-testid="recent-count">{recentTracks.length}</div>
      <div data-testid="favorite-artists-count">{favoriteArtists.length}</div>
      <div data-testid="playlists-loading">{String(playlistsLoading)}</div>
      <div data-testid="favorite-artists-loading">
        {String(favoriteArtistsLoading)}
      </div>
      {playlists.map((item) => (
        <div data-testid="playlist-name" key={item.id}>
          {item.name}
        </div>
      ))}
      <button onClick={() => void loadPlaylists()}>Load playlists</button>
      <button onClick={() => void loadPlaylists(true)}>Refresh playlists</button>
      <button onClick={() => void loadMorePlaylists()}>Load more</button>
      <button onClick={() => appendRecentTrack(sampleTrack)}>Append recent</button>
      <button onClick={() => void loadFavoriteArtists()}>Load favorite artists</button>
      <button onClick={() => void loadFavoriteArtists(true)}>
        Refresh favorite artists
      </button>
    </div>
  );
}

interface SpotifyActivityOverrides {
  getFavoriteArtists?: (limit?: number, forceRefresh?: boolean) => Promise<
    Array<{
      id: string;
      name: string;
      image: string | null;
      followerCount: number;
      genres: string[];
    }>
  >;
  getRecentlyPlayed?: () => Promise<{ items: unknown[]; rateLimited: boolean }>;
  getPlaylistsPage?: (
    limit?: number,
    offset?: number,
    forceRefresh?: boolean,
  ) => Promise<{ items: ReturnType<typeof playlist>[]; total: number }>;
  getPlaylistTracks?: (playlistId: string) => Promise<SpotifyTrack[]>;
}

function renderProvider(overrides: SpotifyActivityOverrides = {}) {
  const getFavoriteArtists =
    overrides.getFavoriteArtists ?? vi.fn().mockResolvedValue([]);
  const getRecentlyPlayed =
    overrides.getRecentlyPlayed ??
    vi.fn().mockResolvedValue({ items: [], rateLimited: false });
  const getPlaylistsPage =
    overrides.getPlaylistsPage ??
    vi.fn().mockResolvedValue({ items: [], total: 0 });
  const getPlaylistTracks =
    overrides.getPlaylistTracks ?? vi.fn().mockResolvedValue([]);

  const action = vi.fn((ref: unknown, args: unknown) => {
    const functionName = getFunctionName(ref as never);

    if (functionName === "spotify:favoriteArtists") {
      const { limit, forceRefresh } = args as {
        limit: number;
        forceRefresh?: boolean;
      };
      return getFavoriteArtists(limit, forceRefresh);
    }

    if (functionName === "spotify:recentlyPlayed") {
      return getRecentlyPlayed();
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
    const nextPage = createDeferred<{
      items: ReturnType<typeof playlist>[];
      total: number;
    }>();
    const getPlaylistsPage = vi.fn((limit = PLAYLIST_PAGE_SIZE, offset = 0) => {
      if (limit !== PLAYLIST_PAGE_SIZE) {
        throw new Error(`Unexpected playlist page size: ${limit}`);
      }

      if (offset === 0) {
        return Promise.resolve({
          items: [playlist("1")],
          total: 2,
        });
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
      false,
    );

    await act(async () => {
      nextPage.resolve({
        items: [playlist("2")],
        total: 2,
      });
      await nextPage.promise;
    });

    await waitFor(() => {
      expect(screen.getByTestId("playlist-count")).toHaveTextContent("2");
    });

    expect(screen.getAllByTestId("playlist-name")).toHaveLength(2);
    expect(screen.getByText("Playlist 2")).toBeInTheDocument();
  });

  it("appends recents locally without refetching Spotify", async () => {
    const getRecentlyPlayed = vi
      .fn()
      .mockResolvedValue({ items: [], rateLimited: false });
    renderProvider({
      getRecentlyPlayed,
    });

    await waitFor(() => {
      expect(screen.getByTestId("recent-count")).toHaveTextContent("0");
    });

    fireEvent.click(screen.getByRole("button", { name: "Append recent" }));

    await waitFor(() => {
      expect(screen.getByTestId("recent-count")).toHaveTextContent("1");
    });

    expect(getRecentlyPlayed).toHaveBeenCalledTimes(1);
  });

  it("loads playlists on mount", async () => {
    const getPlaylistsPage = vi.fn().mockResolvedValue({
      items: [playlist("1")],
      total: 1,
    });

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
      .mockResolvedValueOnce({
        items: [playlist("1")],
        total: 1,
      })
      .mockResolvedValueOnce({
        items: [playlist("2")],
        total: 1,
      });

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

  it("loads favorite artists on mount", async () => {
    const getFavoriteArtists = vi.fn().mockResolvedValue([
      {
        id: "artist-1",
        name: "Artist 1",
        image: null,
        followerCount: 100,
        genres: [],
      },
    ]);
    renderProvider({
      getFavoriteArtists,
    });

    await waitFor(() => {
      expect(screen.getByTestId("favorite-artists-count")).toHaveTextContent("1");
    });

    expect(getFavoriteArtists).toHaveBeenCalledTimes(1);
    expect(getFavoriteArtists).toHaveBeenCalledWith(50, false);
  });

  it("refreshes favorite artists with force refresh", async () => {
    const getFavoriteArtists = vi
      .fn()
      .mockResolvedValueOnce([
        {
          id: "artist-1",
          name: "Artist 1",
          image: null,
          followerCount: 100,
          genres: [],
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "artist-2",
          name: "Artist 2",
          image: null,
          followerCount: 200,
          genres: [],
        },
      ]);

    renderProvider({
      getFavoriteArtists,
    });

    await waitFor(() => {
      expect(screen.getByTestId("favorite-artists-count")).toHaveTextContent("1");
    });

    expect(getFavoriteArtists).toHaveBeenNthCalledWith(1, 50, false);

    fireEvent.click(
      screen.getByRole("button", { name: "Refresh favorite artists" }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("favorite-artists-count")).toHaveTextContent("1");
    });
    expect(getFavoriteArtists).toHaveBeenNthCalledWith(2, 50, true);
  });

  it("dedupes and caps locally appended recents at 30 items", async () => {
    function LimitConsumer() {
      const { appendRecentTrack, recentTracks } = useSpotifyRecentlyPlayed();

      return (
        <div>
          <div data-testid="recent-count">{recentTracks.length}</div>
          <button
            onClick={() => {
              for (let index = 0; index < RECENTLY_PLAYED_LIMIT + 5; index += 1) {
                appendRecentTrack({
                  id: `track-${index}`,
                  name: `Track ${index}`,
                  artist: `Artist ${index}`,
                  albumImage: null,
                  durationMs: 100000,
                  albumName: `Album ${index}`,
                });
              }
              appendRecentTrack({
                id: "track-10",
                name: "Track 10",
                artist: "Artist 10",
                albumImage: null,
                durationMs: 100000,
                albumName: "Album 10",
              });
            }}
          >
            Fill recents
          </button>
        </div>
      );
    }

    vi.mocked(getAuthenticatedSpotifyConvexClient).mockResolvedValue({
      action: vi.fn((ref: unknown) => {
        const functionName = getFunctionName(ref as never);

        if (functionName === "spotify:favoriteArtists") {
          return Promise.resolve([]);
        }

        if (functionName === "spotify:recentlyPlayed") {
          return Promise.resolve({
            items: [],
            rateLimited: false,
          });
        }

        if (functionName === "spotify:playlistsPage") {
          return Promise.resolve({
            items: [],
            total: 0,
          });
        }

        if (functionName === "spotify:playlistTracks") {
          return Promise.resolve([]);
        }

        throw new Error(`Unexpected Spotify action: ${functionName}`);
      }),
    } as never);

    render(
      <SpotifyActivityProvider>
        <LimitConsumer />
      </SpotifyActivityProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("recent-count")).toHaveTextContent("0");
    });

    fireEvent.click(screen.getByRole("button", { name: "Fill recents" }));

    await waitFor(() => {
      expect(screen.getByTestId("recent-count")).toHaveTextContent(
        String(RECENTLY_PLAYED_LIMIT),
      );
    });
  });
});
