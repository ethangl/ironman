import { AtSignIcon, AudioLinesIcon, GlobeIcon, PlayIcon } from "lucide-react";

import { AppLink } from "@/components/app-link";
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { Button } from "@/components/ui/button";
import type { MusicBrainzArtistLinks } from "./types";

export function ArtistExternalLinks({
  links,
}: {
  links: MusicBrainzArtistLinks | null;
}) {
  const items = [
    {
      href: links?.homepage ?? null,
      icon: GlobeIcon,
      label: "Home",
    },
    {
      href: links?.instagram ?? null,
      icon: AtSignIcon,
      label: "Instagram",
    },
    {
      href: links?.youtube ?? null,
      icon: PlayIcon,
      label: "YouTube",
    },
    {
      href: links?.bandcamp ?? null,
      icon: AudioLinesIcon,
      label: "Bandcamp",
    },
  ].filter(
    (item): item is { href: string; icon: typeof GlobeIcon; label: string } =>
      typeof item.href === "string" && item.href.length > 0,
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Links</SectionTitle>
      </SectionHeader>
      <SectionContent className="flex flex-wrap gap-2">
        {items.map(({ href, icon: Icon, label }) => (
          <Button
            key={label}
            size="xs"
            nativeButton={false}
            render={
              <AppLink href={href} target="_blank" rel="noreferrer">
                <Icon className="h-4 w-4" />
                {label}
              </AppLink>
            }
          />
        ))}
      </SectionContent>
    </Section>
  );
}
