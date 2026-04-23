import { AppLink } from "@/components/app-link";
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { Button } from "@/components/ui/button";
import { getSimilarArtistLink } from "./similar-artist-links";
import type { LastFmSimilarArtist } from "./types";

export function ArtistSimilar({
  similarArtists,
}: {
  similarArtists: LastFmSimilarArtist[];
}) {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Similar Artists</SectionTitle>
      </SectionHeader>
      <SectionContent className="flex flex-wrap gap-2">
        {similarArtists.map((similarArtist) => {
          const link = getSimilarArtistLink(similarArtist);
          const key = `${similarArtist.name}:${similarArtist.musicBrainzId ?? "none"}`;

          if (link.href) {
            return (
              <Button
                key={key}
                size="xs"
                nativeButton={false}
                render={
                  <AppLink href={link.href} target="_blank" rel="noreferrer">
                    {similarArtist.name}
                  </AppLink>
                }
              />
            );
          }

          return (
            <Button key={key} size="xs">
              {similarArtist.name}
            </Button>
          );
        })}
      </SectionContent>
    </Section>
  );
}
