import { FC } from "react";

import { AppLink } from "@/components/app-link";
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SpotifyArtist } from "@/features/spotify-client/types";
import { Thumbnail } from "./artist-thumbnail";

export type ArtistsProps = {
  action?: React.ReactNode;
  artists: SpotifyArtist[];
  title: string;
};

export const Artists: FC<ArtistsProps> = ({ action, artists, title }) => {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>
          {title}
          {action}
        </SectionTitle>
      </SectionHeader>
      <ScrollArea>
        <SectionContent className="flex gap-4 w-max">
          {artists.map((artist) => (
            <AppLink key={artist.id} href={`/artist/${artist.id}`}>
              <Thumbnail name={artist.name} src={artist.image} />
            </AppLink>
          ))}
        </SectionContent>
      </ScrollArea>
    </Section>
  );
};
