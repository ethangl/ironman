import { FC } from "react";

import { List } from "@/components/list";
import { Section, SectionHeader, SectionTitle } from "@/components/section";
import type { SpotifyPlaylist } from "@/features/spotify-client/types";
import { PlaylistCell } from "./playlist-cell";

export type PlaylistsProps = {
  action?: React.ReactNode;
  paginate?: React.ReactNode;
  playlists: SpotifyPlaylist[];
  title: string;
};

export const Playlists: FC<PlaylistsProps> = ({
  action,
  paginate,
  playlists,
  title,
}) => (
  <Section>
    <SectionHeader>
      <SectionTitle>
        {title}
        {action}
      </SectionTitle>
    </SectionHeader>
    <List count={playlists.length}>
      {playlists.map((playlist) => (
        <PlaylistCell
          key={playlist.id}
          href={`/playlist/${playlist.id}`}
          image={playlist.image}
          name={playlist.name}
          subtitle={`${playlist.trackCount} songs`}
        />
      ))}
      {paginate}
    </List>
  </Section>
);
