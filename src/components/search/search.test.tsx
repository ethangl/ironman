import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SearchInput } from "./search-input";
import { SearchProvider } from "./search-provider";
import { SearchResults } from "./search-results";

const mockPlayTrack = vi.fn();
const mockPlayTracks = vi.fn();
const mockToastError = vi.fn();

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/hooks/use-web-player", () => ({
  useWebPlayerActions: () => ({
    playTrack: (...args: unknown[]) => mockPlayTrack(...args),
    playTracks: (...args: unknown[]) => mockPlayTracks(...args),
  }),
}));

vi.mock("@/hooks/use-debounce", () => ({
  useDebounce: (value: string) => value,
}));

vi.mock("../play-button", () => ({
  PlayButton: ({ onClick }: { onClick?: () => void }) => (
    <button onClick={onClick}>Play track</button>
  ),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function renderSearch() {
  return render(
    <SearchProvider>
      <SearchInput />
      <SearchResults />
    </SearchProvider>,
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
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({
        tracks: [
          {
            id: "track-1",
            name: "Panopticon",
            artist: "ISIS",
            albumName: "Oceanic",
            albumImage: "track.jpg",
            durationMs: 320000,
            topStreak: null,
            difficulty: 4,
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
    );

    renderSearch();
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
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse(
        {
          error: {
            message: "Could not search Spotify right now.",
          },
        },
        502,
      ),
    );

    renderSearch();
    await searchFor("isis");

    await waitFor(() => {
      expect(
        screen.getByText("Could not search Spotify right now."),
      ).toBeInTheDocument();
    });
  });

  it("loads playlist tracks and starts playback from a playlist search result", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes("/api/search?")) {
        return jsonResponse({
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
        });
      }

      if (url.endsWith("/api/playlists/playlist-1")) {
        return jsonResponse({
          items: [
            {
              id: "track-1",
              name: "Weight",
              artist: "ISIS",
              albumImage: "track.jpg",
              durationMs: 640000,
            },
          ],
        });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    renderSearch();
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
