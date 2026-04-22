import { Link } from "react-router-dom";

import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
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
      <SectionContent className="flex flex-wrap gap-2 px-3 pb-3">
        {similarArtists.map((similarArtist) => {
          const link = getSimilarArtistLink(similarArtist);
          const key = `${similarArtist.name}:${similarArtist.musicBrainzId ?? "none"}`;
          const className =
            "inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/25 px-3 py-1.5 text-sm text-white/82 transition hover:bg-black/40";

          if (link.href && !link.external) {
            return (
              <Link key={key} to={link.href} className={className}>
                <span>{similarArtist.name}</span>
              </Link>
            );
          }

          if (link.href) {
            return (
              <a
                key={key}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className={className}
              >
                <span>{similarArtist.name}</span>
              </a>
            );
          }

          return (
            <span key={key} className={className}>
              <span>{similarArtist.name}</span>
            </span>
          );
        })}
      </SectionContent>
    </Section>
  );
}
