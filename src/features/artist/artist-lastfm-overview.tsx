import { ExternalLinkIcon } from "lucide-react";

import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import type { LastFmArtistMatch } from "./types";

export function ArtistLastFmOverview({
  artist,
}: {
  artist: LastFmArtistMatch | null;
}) {
  if (!artist) {
    return null;
  }

  const {
    bio: { summary },
    lastFmUrl,
  } = artist;

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>About</SectionTitle>
      </SectionHeader>
      <SectionContent className="space-y-6">
        {summary && summary.length > 0 && (
          <p className="max-w-prose text-sm leading-6 text-white/82">
            {summary}
          </p>
        )}

        {lastFmUrl && (
          <a
            href={lastFmUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 self-start text-sm text-white/68 transition hover:text-white/90"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            <span>More on Last.fm</span>
          </a>
        )}
      </SectionContent>
    </Section>
  );
}
