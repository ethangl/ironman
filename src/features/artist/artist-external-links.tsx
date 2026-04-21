import { AtSignIcon, AudioLinesIcon, GlobeIcon, PlayIcon } from "lucide-react";

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
    <div className="flex flex-wrap gap-2">
      {items.map(({ href, icon: Icon, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-2 text-sm font-medium text-white/95 backdrop-blur-sm transition hover:bg-black/55"
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </a>
      ))}
    </div>
  );
}
