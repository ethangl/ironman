import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  PLAYLIST_PAGE_SIZE,
  SpotifyClientProvider,
  createSpotifyClient,
} from "@/features/spotify/client";
import type { SpotifyActivityClient } from "@/features/spotify/client/spotify-activity-client";
import { SpotifyActivityProvider } from "./spotify-activity-provider";
import { useSpotifyActivity } from "./use-spotify-activity";

const mockUseSpotifyRecentPolling = vi.fn();

vi.mock("@/app", () => ({
  useAppCapabilities: () => ({
    canBrowsePersonalSpotify: true,
  }),
}));

vi.mock("./use-spotify-recent-polling", () => ({
  useSpotifyRecentPolling: (...args: unknown[]) =>
    mockUseSpotifyRecentPolling(...args),
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
  const { playlists, loadMorePlaylists } = useSpotifyActivity();

  return (
    <div>
      <div data-testid="playlist-count">{playlists.length}</div>
      {playlists.map((item) => (
        <div data-testid="playlist-name" key={item.id}>
          {item.name}
        </div>
      ))}
      <button onClick={() => void loadMorePlaylists()}>Load more</button>
    </div>
  );
}

function renderProvider(overrides: Partial<SpotifyActivityClient> = {}) {
  return render(
    <SpotifyClientProvider
      client={createSpotifyClient({
        spotifyActivity: {
          getActivitySnapshot: vi.fn().mockResolvedValue({
            recentlyPlayed: { items: [], rateLimited: false },
            playlistsPage: { items: [], total: 0 },
            favoriteArtists: [],
          }),
          getFavoriteArtists: vi.fn().mockResolvedValue([]),
          getRecentlyPlayed: vi
            .fn()
            .mockResolvedValue({ items: [], rateLimited: false }),
          getPlaylistsPage: vi.fn().mockResolvedValue({ items: [], total: 0 }),
          getPlaylistTracks: vi.fn().mockResolvedValue([]),
          getTopArtists: vi.fn().mockResolvedValue([]),
          ...overrides,
        },
      })}
    >
      <SpotifyActivityProvider>
        <ActivityConsumer />
      </SpotifyActivityProvider>
    </SpotifyClientProvider>,
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

      if (offset === 1) {
        return nextPage.promise;
      }

      throw new Error(`Unexpected playlist offset: ${offset}`);
    });

    renderProvider({
      getActivitySnapshot: vi.fn().mockResolvedValue({
        recentlyPlayed: { items: [], rateLimited: false },
        playlistsPage: {
          items: [playlist("1")],
          total: 2,
        },
        favoriteArtists: [],
      }),
      getPlaylistsPage,
    });

    await waitFor(() => {
      expect(screen.getByTestId("playlist-count")).toHaveTextContent("1");
    });

    const loadMore = screen.getByRole("button", { name: "Load more" });
    fireEvent.click(loadMore);
    fireEvent.click(loadMore);

    expect(getPlaylistsPage).toHaveBeenCalledTimes(1);

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

  it("waits for the initial activity snapshot before enabling recent polling", async () => {
    const snapshot =
      createDeferred<
        Awaited<
          ReturnType<NonNullable<SpotifyActivityClient["getActivitySnapshot"]>>
        >
      >();

    renderProvider({
      getActivitySnapshot: vi.fn().mockReturnValue(snapshot.promise),
    });

    expect(mockUseSpotifyRecentPolling).toHaveBeenCalled();
    expect(mockUseSpotifyRecentPolling).toHaveBeenLastCalledWith({
      enabled: false,
      refreshRecent: expect.any(Function),
    });

    await act(async () => {
      snapshot.resolve({
        recentlyPlayed: { items: [], rateLimited: false },
        playlistsPage: { items: [], total: 0 },
        favoriteArtists: [],
      });
      await snapshot.promise;
    });

    await waitFor(() => {
      expect(mockUseSpotifyRecentPolling).toHaveBeenLastCalledWith({
        enabled: true,
        refreshRecent: expect.any(Function),
      });
    });
  });
});
