import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  SpotifySearchResults,
  SpotifyTrack,
} from "@/features/spotify-client/types";
import { getAuthenticatedSpotifyConvexClient } from "@/features/spotify-client/spotify-convex-client";
import { getFunctionName } from "convex/server";
import { SearchProvider } from "./search-provider";
import { SpotifySearch } from "./spotify-search";

const mockPlayTrack = vi.fn();
const mockPlayTracks = vi.fn();
const mockToastError = vi.fn();
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
    playTracks: (...args: unknown[]) => mockPlayTracks(...args),
  }),
  useWebPlayer: () => ({
    playTrack: (...args: unknown[]) => mockPlayTrack(...args),
    playTracks: (...args: unknown[]) => mockPlayTracks(...args),
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

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

interface SearchOverrides {
  searchResults?: (query: string) => Promise<SpotifySearchResults>;
}

interface SpotifyReadOverrides {
  getPlaylistTracks?: (playlistId: string) => Promise<SpotifyTrack[]>;
}

function renderSearch(
  overrides: {
    search?: SearchOverrides;
    spotifyReads?: SpotifyReadOverrides;
  } = {},
  options?: { extraUi?: React.ReactNode },
) {
  const searchResults =
    overrides.search?.searchResults ??
    vi.fn().mockResolvedValue({
      tracks: [],
      playlists: [],
      artists: [],
    });
  const getPlaylistTracks =
    overrides.spotifyReads?.getPlaylistTracks ??
    vi.fn().mockResolvedValue([]);

  const action = vi.fn((ref: unknown, args: unknown) => {
    const functionName = getFunctionName(ref as never);

    if (functionName === "spotify:search") {
      return searchResults((args as { query: string }).query);
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
  return screen.getByPlaceholderText(
    "Search Spotify for songs, artists, or playlists...",
  );
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

  it("renders songs, playlists, and artists from one search response", async () => {
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
          playlists: [
            {
              id: "playlist-1",
              name: "Heavy Rotation",
              description: null,
              image: "playlist.jpg",
              owner: "ethan",
              public: true,
              trackCount: 12,
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
      expect(screen.getByText("Playlists")).toBeInTheDocument();
      expect(screen.getByText("Artists")).toBeInTheDocument();
    });

    expect(screen.getByText("Panopticon")).toBeInTheDocument();
    expect(screen.getByText("Heavy Rotation")).toBeInTheDocument();
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
          playlists: [],
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
        screen.queryByPlaceholderText(
          "Search Spotify for songs, artists, or playlists...",
        ),
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

  it("loads playlist tracks and starts playback from a playlist search result", async () => {
    renderSearch({
      search: {
        searchResults: vi.fn().mockResolvedValue({
          tracks: [],
          playlists: [
            {
              id: "playlist-1",
              name: "Heavy Rotation",
              description: null,
              image: "playlist.jpg",
              owner: "ethan",
              public: true,
              trackCount: 12,
            },
          ],
          artists: [],
        }),
      },
      spotifyReads: {
        getPlaylistTracks: vi.fn().mockResolvedValue([
          {
            id: "track-1",
            name: "Weight",
            artist: "ISIS",
            albumImage: "track.jpg",
            durationMs: 640000,
          },
        ]),
      },
    });
    await searchFor("heavy");

    await waitFor(() => {
      expect(screen.getByText("Heavy Rotation")).toBeInTheDocument();
    });

    fireEvent.click(getCommandItem("Heavy Rotation"));

    await waitFor(() => {
      expect(mockPlayTracks).toHaveBeenCalledWith([
        {
          id: "track-1",
          name: "Weight",
          artist: "ISIS",
          albumImage: "track.jpg",
          durationMs: 640000,
        },
      ]);
    });

    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("clears the search query when navigation changes the url", async () => {
    renderSearch(
      {
        search: {
          searchResults: vi.fn().mockResolvedValue({
            tracks: [],
            playlists: [],
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
