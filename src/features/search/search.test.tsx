import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
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
const mockScrollTo = vi.fn();

vi.mock("@/features/spotify/player", () => ({
  PlaylistCell: ({
    name,
    onPlay,
    tracks,
  }: {
    name: string;
    onPlay?: (tracks: unknown[]) => void;
    tracks: unknown[];
  }) => (
    <div>
      <span>{name}</span>
      <button onClick={() => onPlay?.(tracks)}>Play</button>
    </div>
  ),
  TrackCell: ({
    track,
  }: {
    track: {
      name: string;
      artist: string;
    };
  }) => (
    <div>
      <span>{track.name}</span>
      <span>{track.artist}</span>
    </div>
  ),
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

function renderSearch(
  overrides: Parameters<typeof createSpotifyClient>[0] = {},
  options?: { extraUi?: React.ReactNode },
) {
  return render(
    <MemoryRouter initialEntries={["/home"]}>
      <SpotifyClientProvider client={createSpotifyClient(overrides)}>
        <SearchProvider>
          {options?.extraUi}
          <SearchInput />
          <SearchResults />
        </SearchProvider>
      </SpotifyClientProvider>
    </MemoryRouter>,
  );
}

function NavigateButton() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate("/artist/artist-1")}>Go to artist</button>
  );
}

async function searchFor(query: string) {
  fireEvent.change(
    screen.getByPlaceholderText(
      "Search Spotify for songs, artists, or playlists...",
    ),
    { target: { value: query } },
  );
  await act(async () => {
    await Promise.resolve();
  });
}

describe("search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = mockScrollTo;
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
      expect(screen.getByText('Songs matching "isis"')).toBeInTheDocument();
      expect(screen.getByText('Playlists matching "isis"')).toBeInTheDocument();
      expect(screen.getByText('Artists matching "isis"')).toBeInTheDocument();
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
        getCachedFavoriteArtists: vi.fn().mockResolvedValue([]),
        getCachedPlaylistsPage: vi.fn().mockResolvedValue({ items: [], total: 0 }),
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

    fireEvent.click(screen.getByRole("button", { name: "Play track" }));

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

  it("clears the search panel when navigation changes the url", async () => {
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
          searchTracks: vi.fn().mockResolvedValue([]),
        },
      },
      { extraUi: <NavigateButton /> },
    );

    await searchFor("isis");

    await waitFor(() => {
      expect(screen.getByText('Artists matching "isis"')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Go to artist" }));

    await waitFor(() => {
      expect(
        screen.queryByText('Artists matching "isis"'),
      ).not.toBeInTheDocument();
    });

    expect(
      screen.getByPlaceholderText(
        "Search Spotify for songs, artists, or playlists...",
      ),
    ).toHaveValue("");
    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
  });
});
