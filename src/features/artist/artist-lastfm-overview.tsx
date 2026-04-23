import { ExternalLinkIcon } from "lucide-react";

import { AppLink } from "@/components/app-link";
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { Button } from "@/components/ui/button";
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
          <Button
            size="xs"
            nativeButton={false}
            render={
              <AppLink href={lastFmUrl} target="_blank" rel="noreferrer">
                <ExternalLinkIcon className="h-4 w-4" />
                <span>More on Last.fm</span>
              </AppLink>
            }
          />
        )}
      </SectionContent>
    </Section>
  );
}
