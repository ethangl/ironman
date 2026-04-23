import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SpotifySearchResults } from "@/features/spotify-client/types";
import { getAuthenticatedSpotifyConvexClient } from "@/features/spotify-client/spotify-convex-client";
import { getFunctionName } from "convex/server";
import { SearchProvider } from "./search-provider";
import { SpotifySearch } from "./spotify-search";

const mockPlayTrack = vi.fn();
const mockScrollTo = vi.fn();

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.mock("@/features/spotify-client/spotify-convex-client", () => ({
  getAuthenticatedSpotifyConvexClient: vi.fn(),
}));

vi.mock("@/features/spotify-player", () => ({
  useWebPlayerActions: () => ({
    playTrack: (...args: unknown[]) => mockPlayTrack(...args),
  }),
  useWebPlayer: () => ({
    playTrack: (...args: unknown[]) => mockPlayTrack(...args),
    currentTrack: null,
    sdkState: null,
    paused: true,
    progressMs: 0,
    durationMs: 0,
    volume: 1,
    expanded: false,
    palette: [],
    queue: [],
    queueIndex: 0,
    shuffled: false,
    hasQueue: false,
    isAuthenticated: true,
    nextTrack: vi.fn(),
    prevTrack: vi.fn(),
    togglePlay: vi.fn(),
    toggleShuffle: vi.fn(),
    setVolume: vi.fn(),
    setExpanded: vi.fn(),
    spotify: {
      init: vi.fn(),
      waitForReady: vi.fn(),
      play: vi.fn(),
      setRepeat: vi.fn(),
    },
  }),
}));

vi.mock("@/hooks/use-debounce", () => ({
  useDebounce: (value: string) => value,
}));

interface SearchOverrides {
  searchResults?: (query: string) => Promise<SpotifySearchResults>;
}

function renderSearch(
  overrides: {
    search?: SearchOverrides;
  } = {},
  options?: { extraUi?: React.ReactNode },
) {
  const searchResults =
    overrides.search?.searchResults ??
    vi.fn().mockResolvedValue({
      tracks: [],
      artists: [],
    });

  const action = vi.fn((ref: unknown, args: unknown) => {
    const functionName = getFunctionName(ref as never);

    if (functionName === "spotify:search") {
      return searchResults((args as { query: string }).query);
    }

    throw new Error(`Unexpected Spotify action: ${functionName}`);
  });

  vi.mocked(getAuthenticatedSpotifyConvexClient).mockResolvedValue({
    action,
  } as never);

  return render(
    <MemoryRouter initialEntries={["/home"]}>
      <SearchProvider>
        <SpotifySearch />
        {options?.extraUi}
      </SearchProvider>
    </MemoryRouter>,
  );
}

function NavigateButton() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate("/artist/artist-1")}>Go to artist</button>
  );
}

function getSearchInput() {
  return screen.getByPlaceholderText("Search Spotify for songs or artists...");
}

function getCommandItem(label: string) {
  const item = screen.getByText(label).closest('[data-slot="command-item"]');
  if (!item) {
    throw new Error(`Could not find command item for ${label}`);
  }
  return item;
}

async function searchFor(query: string) {
  fireEvent.click(screen.getByRole("button", { name: "Search Spotify" }));
  fireEvent.change(getSearchInput(), { target: { value: query } });
}

describe("search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
    window.scrollTo = mockScrollTo;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders songs and artists from one search response", async () => {
    renderSearch({
      search: {
        searchResults: vi.fn().mockResolvedValue({
          tracks: [
            {
              id: "track-1",
              name: "Panopticon",
              artist: "ISIS",
              albumName: "Oceanic",
              albumImage: "track.jpg",
              durationMs: 320000,
            },
          ],
          artists: [
            {
              id: "artist-1",
              name: "ISIS",
              image: "artist.jpg",
              followerCount: 0,
              genres: ["post-metal"],
            },
          ],
        }),
      },
    });
    await searchFor("isis");

    await waitFor(() => {
      expect(screen.getByText("Songs")).toBeInTheDocument();
      expect(screen.getByText("Artists")).toBeInTheDocument();
    });

    expect(screen.getByText("Panopticon")).toBeInTheDocument();
    expect(screen.getAllByText("ISIS")).toHaveLength(2);
  });

  it("plays a selected track from spotify search", async () => {
    renderSearch({
      search: {
        searchResults: vi.fn().mockResolvedValue({
          tracks: [
            {
              id: "track-1",
              name: "Panopticon",
              artist: "ISIS",
              albumName: "Oceanic",
              albumImage: "track.jpg",
              durationMs: 320000,
            },
          ],
          artists: [],
        }),
      },
    });
    await searchFor("isis");

    await waitFor(() => {
      expect(screen.getByText("Panopticon")).toBeInTheDocument();
    });

    fireEvent.click(getCommandItem("Panopticon"));

    expect(mockPlayTrack).toHaveBeenCalledWith({
      id: "track-1",
      name: "Panopticon",
      artist: "ISIS",
      albumName: "Oceanic",
      albumImage: "track.jpg",
      durationMs: 320000,
    });

    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText("Search Spotify for songs or artists..."),
      ).not.toBeInTheDocument();
    });
  });

  it("shows a friendly error message when search fails", async () => {
    renderSearch({
      search: {
        searchResults: vi
          .fn()
          .mockRejectedValue(new Error("Could not search Spotify right now.")),
      },
    });
    await searchFor("isis");

    await waitFor(() => {
      expect(
        screen.getByText("Could not search Spotify right now."),
      ).toBeInTheDocument();
    });
  });

  it("clears the search query when navigation changes the url", async () => {
    renderSearch(
      {
        search: {
          searchResults: vi.fn().mockResolvedValue({
            tracks: [],
            artists: [
              {
                id: "artist-1",
                name: "ISIS",
                image: "artist.jpg",
                followerCount: 0,
                genres: ["post-metal"],
              },
            ],
          }),
        },
      },
      { extraUi: <NavigateButton /> },
    );

    await searchFor("isis");

    await waitFor(() => {
      expect(screen.getByText("ISIS")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Go to artist"));

    await waitFor(() => {
      expect(getSearchInput()).toHaveValue("");
    });

    expect(screen.queryByText("ISIS")).not.toBeInTheDocument();
    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
  });
});
