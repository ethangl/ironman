import { FC } from "react";

import { List } from "@/components/list";
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import type { SpotifyArtist } from "@/features/spotify-client/types";
import { ArtistCell } from "./artist-cell";

export type ArtistsProps = {
  action?: React.ReactNode;
  artists: SpotifyArtist[];
  paginate?: React.ReactNode;
  title: string;
};

export const Artists: FC<ArtistsProps> = ({
  action,
  artists,
  paginate,
  title,
}) => (
  <Section>
    <SectionHeader>
      <SectionTitle>
        {title}
        {action}
      </SectionTitle>
    </SectionHeader>
    <SectionContent>
      <List count={artists.length}>
        {artists.map((artist) => (
          <ArtistCell
            key={artist.id}
            href={`/artist/${artist.id}`}
            artist={artist}
          />
        ))}
        {paginate}
      </List>
    </SectionContent>
  </Section>
);
