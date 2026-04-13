import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  SpotifyClientProvider,
  createSpotifyClient,
} from "@/features/spotify/client";
import { SearchInput } from "./search-input";
import { SearchProvider } from "./search-provider";
import { SearchResults } from "./search-results";

const mockPlayTrack = vi.fn();
const mockPlayTracks = vi.fn();
const mockToastError = vi.fn();

vi.mock("@/features/spotify/player", () => ({
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
    streak: null,
    count: 0,
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
    lockIn: vi.fn(),
    activateHardcore: vi.fn(),
    surrender: vi.fn(),
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

vi.mock("@/components/play-button", () => ({
  PlayButton: ({ onClick }: { onClick?: () => void }) => (
    <button onClick={onClick}>Play track</button>
  ),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

function renderSearch(overrides: Parameters<typeof createSpotifyClient>[0] = {}) {
  return render(
    <SpotifyClientProvider client={createSpotifyClient(overrides)}>
      <SearchProvider>
        <SearchInput />
        <SearchResults />
      </SearchProvider>
    </SpotifyClientProvider>,
  );
}

async function searchFor(query: string) {
  fireEvent.change(
    screen.getByPlaceholderText("Search songs, artists, or playlists..."),
    { target: { value: query } },
  );
  await act(async () => {
    await Promise.resolve();
  });
}

describe("search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
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
        searchTracks: vi.fn().mockResolvedValue([]),
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

  it("shows a friendly error message when search fails", async () => {
    renderSearch({
      search: {
        searchResults: vi
          .fn()
          .mockRejectedValue(new Error("Could not search Spotify right now.")),
        searchTracks: vi.fn().mockResolvedValue([]),
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
        searchTracks: vi.fn().mockResolvedValue([]),
      },
      spotifyActivity: {
        getFavoriteArtists: vi.fn().mockResolvedValue([]),
        getRecentlyPlayed: vi
          .fn()
          .mockResolvedValue({ items: [], rateLimited: false }),
        getPlaylistsPage: vi.fn().mockResolvedValue({ items: [], total: 0 }),
        getPlaylistTracks: vi.fn().mockResolvedValue([
          {
            id: "track-1",
            name: "Weight",
            artist: "ISIS",
            albumImage: "track.jpg",
            durationMs: 640000,
          },
        ]),
        getTopArtists: vi.fn().mockResolvedValue([]),
      },
    });
    await searchFor("heavy");

    await waitFor(() => {
      expect(screen.getByText("Heavy Rotation")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Play" }));

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
});
