import { useState } from "react";

import { List } from "@/components/list";
import { Section, SectionHeader, SectionTitle } from "@/components/section";
import { SidebarContent } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { ArtistCell } from "@/features/artist/artist-cell";
import { useOptionalRooms } from "@/features/rooms";
import { PlaylistCell } from "@/features/spotify-playlists/playlist-cell";
import { SpotifyHeader } from "@/features/spotify-shell/spotify-header";
import { Tracks } from "@/features/spotify-tracks";
import { useLibraryArtists } from "./use-library-artists";
import { useLibraryPlaylists } from "./use-library-playlists";
import { useRecentlyPlayed } from "./use-recently-played";

export function Home() {
  const rooms = useOptionalRooms();
  const connection = rooms?.playbackConnection ?? null;
  const authorized = connection?.status === "authorized";
  const [connecting, setConnecting] = useState(false);

  const { data: playlists } = useLibraryPlaylists(authorized);
  const { data: recentTracks } = useRecentlyPlayed(authorized);
  const { data: artists } = useLibraryArtists(authorized);

  if (!authorized) {
    return (
      <>
        <SpotifyHeader title="Apple Music" />
        <SidebarContent>
          <div className="flex flex-col items-start gap-3 px-4 py-8">
            <p className="text-sm text-muted-foreground">
              Connect Apple Music to see your library.
            </p>
            {connection ? (
              <Button
                disabled={connecting}
                onClick={() => {
                  setConnecting(true);
                  void connection.connect().finally(() => setConnecting(false));
                }}
              >
                Connect Apple Music
              </Button>
            ) : null}
          </div>
        </SidebarContent>
      </>
    );
  }

  return (
    <>
      <SpotifyHeader title="Apple Music" />
      <SidebarContent>
        <Section>
          <SectionHeader>
            <SectionTitle>Your Playlists</SectionTitle>
          </SectionHeader>
          <List count={playlists?.length ?? 0}>
            {(playlists ?? []).map((playlist) => (
              <PlaylistCell
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                image={playlist.image}
                name={playlist.name}
                subtitle={playlist.description ?? undefined}
              />
            ))}
          </List>
        </Section>

        <Tracks
          title="Recently Played"
          tracks={recentTracks ?? []}
          getTrackKey={(track, index) => `${track.id}:${index}`}
        />

        <Section>
          <SectionHeader>
            <SectionTitle>Your Artists</SectionTitle>
          </SectionHeader>
          <List count={artists?.length ?? 0}>
            {(artists ?? []).map((artist) => (
              <ArtistCell
                key={artist.id}
                href={`/artist/${artist.id}`}
                artist={{
                  id: artist.id,
                  name: artist.name,
                  image: artist.image,
                  followerCount: 0,
                  genres: [],
                }}
              />
            ))}
          </List>
        </Section>
      </SidebarContent>
    </>
  );
}
