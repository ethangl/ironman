import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import type { Track } from "@/features/catalog/types";
import { Playlist } from "./playlist";

const playlist = { id: "p.1", name: "Road Trip", image: null, description: null };
const tracks: Track[] = [
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

vi.mock("./library-client", () => ({
  getLibraryPlaylist: () => Promise.resolve(playlist),
  getLibraryPlaylistTracks: () => Promise.resolve(tracks),
}));

// The sidebar shell needs a SidebarStateContext provider it can't get in a unit
// render; stub it to plain passthroughs so the track list stays real.
vi.mock("@/features/shell/app-header", () => ({
  AppHeader: ({ title }: { title: ReactNode }) => <h1>{title}</h1>,
}));
vi.mock("@/components/sidebar", () => ({
  SidebarContent: ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("Playlist", () => {
  it("renders the playlist's tracks and an enqueue-all action", async () => {
    render(
      <MemoryRouter initialEntries={["/playlist/p.1"]}>
        <Routes>
          <Route path="/playlist/:playlistId" element={<Playlist />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", { name: "Road Trip" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 songs")).toBeInTheDocument();
    expect(screen.getByText("Get Lucky")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Queue Road Trip" }),
    ).toBeInTheDocument();
  });
});
