import { FC } from "react";

import { List, ListLink } from "@/components/list";
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import type { SpotifyPlaylist } from "@/features/spotify-client/types";
import { PlaylistCell } from "./playlist-cell";

export type PlaylistsProps = {
  action?: React.ReactNode;
  playlists: SpotifyPlaylist[];
  title: string;
};

export const Playlists: FC<PlaylistsProps> = ({ action, playlists, title }) => (
  <Section>
    <SectionHeader>
      <SectionTitle>
        {title}
        {action}
      </SectionTitle>
    </SectionHeader>
    <SectionContent>
      <List count={playlists.length}>
        {playlists.map((playlist) => (
          <ListLink key={playlist.id} href={`/playlist/${playlist.id}`}>
            <PlaylistCell
              image={playlist.image}
              name={playlist.name}
              subtitle={
                playlist.owner
                  ? `${playlist.trackCount} songs by ${playlist.owner}`
                  : `${playlist.trackCount} songs`
              }
            />
          </ListLink>
        ))}
      </List>
    </SectionContent>
  </Section>
);
