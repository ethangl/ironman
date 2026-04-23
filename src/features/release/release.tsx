import { FC } from "react";

import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { SidebarContent } from "@/components/sidebar";
import { ArtistHeader } from "../artist/artist-header";
import { useRelease } from "./release-provider";

export const Release: FC = () => {
  const { artistId, data: album } = useRelease();
  const artistNames = album.artists.map((artist) => artist.name).join(", ");

  return (
    <>
      <ArtistHeader href={`/artist/${artistId}`} title={album.name} />
      <SidebarContent>
        <Section>
          <SectionHeader>
            <SectionTitle>{album.name}</SectionTitle>
            <SectionDescription>{artistNames}</SectionDescription>
          </SectionHeader>
        </Section>
      </SidebarContent>
    </>
  );
};
