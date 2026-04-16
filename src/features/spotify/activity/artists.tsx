import { FC } from "react";

import { AppLink } from "@/components/app-link";
import { Section, SectionProps } from "@/components/section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Thumbnail } from "@/features/spotify/activity/thumbnail";
import { SpotifyArtist } from "@/types";

export type ArtistsProps = SectionProps & { artists: SpotifyArtist[] };

export const Artists: FC<ArtistsProps> = ({ artists, ...props }) => {
  return (
    <Section {...props}>
      <ScrollArea>
        <ol className="flex gap-4 p-4 w-max">
          {artists.map((artist) => (
            <li key={artist.id}>
              <AppLink href={`/artist/${artist.id}`}>
                <Thumbnail name={artist.name} src={artist.image} />
              </AppLink>
            </li>
          ))}
        </ol>
      </ScrollArea>
    </Section>
  );
};
