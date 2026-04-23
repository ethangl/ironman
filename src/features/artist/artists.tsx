import { FC } from "react";

import { List, ListLink } from "@/components/list";
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
          <ListLink key={artist.id} href={`/artist/${artist.id}`}>
            <ArtistCell artist={artist} />
          </ListLink>
        ))}
        {paginate}
      </List>
    </SectionContent>
  </Section>
);
