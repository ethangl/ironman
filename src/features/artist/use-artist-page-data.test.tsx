import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  SpotifyAlbumRelease,
  SpotifyArtistPageData,
  SpotifyPage,
} from "@/features/spotify-client/types";
import { useArtistPageData } from "./use-artist-page-data";

vi.mock("./spotify-artist-client", () => ({
  getSpotifyArtistPageData: vi.fn(),
  getSpotifyArtistReleasesPage: vi.fn(),
}));

import {
  getSpotifyArtistPageData,
  getSpotifyArtistReleasesPage,
} from "./spotify-artist-client";

function createAlbumRelease(
  id: string,
  name: string,
): SpotifyAlbumRelease {
  return {
    id,
    name,
    image: `${id}.jpg`,
    releaseDate: "2002-09-28",
    totalTracks: 8,
    albumType: "album",
  };
}

function createPage<TItem>(
  items: TItem[],
  overrides: Partial<SpotifyPage<TItem>> = {},
): SpotifyPage<TItem> {
  return {
    items,
    offset: 0,
    limit: 10,
    total: items.length,
    nextOffset: null,
    hasMore: false,
    ...overrides,
  };
}

function createArtistPage(): SpotifyArtistPageData {
  return {
    artist: {
      id: "artist-1",
      name: "ISIS",
      image: "artist.jpg",
      followerCount: 1234,
      genres: ["post-metal"],
    },
    topTracks: [],
    albums: createPage([createAlbumRelease("album-1", "Oceanic")], {
      total: 2,
      nextOffset: 1,
      hasMore: true,
    }),
    singles: createPage([createAlbumRelease("single-1", "Holy Tears")]),
  };
}

function ArtistPageDataConsumer({ artistId }: { artistId: string }) {
  const {
    data,
    loading,
    loadMoreReleases,
    loadingReleaseGroups,
  } = useArtistPageData(artistId);

  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="album-count">{data?.albums.items.length ?? 0}</div>
      <div data-testid="single-count">{data?.singles.items.length ?? 0}</div>
      <div data-testid="album-loading">
        {String(loadingReleaseGroups.album)}
      </div>
      <div data-testid="album-names">
        {data?.albums.items.map((item) => item.name).join(",") ?? ""}
      </div>
      <button onClick={() => void loadMoreReleases("album")}>
        Load more albums
      </button>
    </div>
  );
}

describe("useArtistPageData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSpotifyArtistPageData).mockResolvedValue(createArtistPage());
  });

  it("appends album pages without disturbing singles", async () => {
    vi.mocked(getSpotifyArtistReleasesPage).mockResolvedValue(
      createPage([createAlbumRelease("album-2", "Panopticon")], {
        offset: 1,
        total: 2,
        nextOffset: null,
        hasMore: false,
      }),
    );

    render(<ArtistPageDataConsumer artistId="artist-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("album-count")).toHaveTextContent("1");
    });

    fireEvent.click(screen.getByRole("button", { name: "Load more albums" }));

    await waitFor(() => {
      expect(screen.getByTestId("album-count")).toHaveTextContent("2");
    });
    expect(screen.getByTestId("single-count")).toHaveTextContent("1");
    expect(screen.getByTestId("album-names")).toHaveTextContent(
      "Oceanic,Panopticon",
    );
    expect(getSpotifyArtistReleasesPage).toHaveBeenCalledWith(
      "artist-1",
      "album",
      1,
      10,
    );
  });

  it("ignores duplicate load-more clicks while a page is in flight", async () => {
    let resolvePage!: (page: SpotifyPage<SpotifyAlbumRelease>) => void;
    vi.mocked(getSpotifyArtistReleasesPage).mockImplementation(
      () =>
        new Promise<SpotifyPage<SpotifyAlbumRelease>>((resolve) => {
          resolvePage = resolve;
        }),
    );

    render(<ArtistPageDataConsumer artistId="artist-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("album-count")).toHaveTextContent("1");
    });

    const button = screen.getByRole("button", { name: "Load more albums" });
    fireEvent.click(button);
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("album-loading")).toHaveTextContent("true");
    });
    expect(getSpotifyArtistReleasesPage).toHaveBeenCalledTimes(1);

    resolvePage(
      createPage([createAlbumRelease("album-2", "Panopticon")], {
        offset: 1,
        total: 2,
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("album-loading")).toHaveTextContent("false");
    });
    expect(screen.getByTestId("album-count")).toHaveTextContent("2");
  });
});
