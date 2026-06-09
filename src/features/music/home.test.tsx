import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import type { SpotifyTrack } from "@/features/spotify-client/types";
import { Home } from "./home";

const playlists = [
  { id: "p.1", name: "Road Trip", image: null, description: null },
];
const recentTracks: SpotifyTrack[] = [
  {
    id: "100",
    name: "Get Lucky",
    artist: "Daft Punk",
    albumName: "Random Access Memories",
    albumImage: null,
    durationMs: 369_000,
    isrc: "ISRC100",
  },
];
const artists = [{ id: "5468295", name: "Daft Punk", image: null }];

vi.mock("./library-client", () => ({
  getLibraryPlaylists: () => Promise.resolve(playlists),
  getRecentlyPlayed: () => Promise.resolve(recentTracks),
  getLibraryArtists: () => Promise.resolve(artists),
}));

vi.mock("@/features/rooms", () => ({
  useOptionalRooms: () => ({ playbackConnection: { status: "authorized" } }),
}));

// The sidebar shell needs a SidebarStateContext provider it can't get in a unit
// render; stub it to plain passthroughs so the sections stay real.
vi.mock("@/features/spotify-shell/spotify-header", () => ({
  SpotifyHeader: ({ title }: { title: ReactNode }) => <h1>{title}</h1>,
}));
vi.mock("@/components/sidebar", () => ({
  SidebarContent: ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("Home", () => {
  it("renders playlists, recently-played, and library artists", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    // Playlist (browse cell) + its link target.
    const playlistLink = await screen.findByRole("link", { name: /Road Trip/ });
    expect(playlistLink).toHaveAttribute("href", "/playlist/p.1");

    // Recently-played track.
    expect(screen.getByText("Get Lucky")).toBeInTheDocument();

    // Library artist links to the catalog artist page.
    const artistLink = screen.getByRole("link", { name: /Daft Punk/ });
    expect(artistLink).toHaveAttribute("href", "/artist/5468295");
  });
});
