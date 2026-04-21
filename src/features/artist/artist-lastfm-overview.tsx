import { ExternalLinkIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { getSimilarArtistLink } from "./similar-artist-links";
import type { LastFmArtistMatch } from "./types";

export function ArtistLastFmOverview({
  artist,
}: {
  artist: LastFmArtistMatch;
}) {
  const hasBio =
    typeof artist.bio.summary === "string" && artist.bio.summary.length > 0;
  const hasSimilarArtists = artist.similarArtists.length > 0;

  if (!hasBio && !hasSimilarArtists) {
    return null;
  }

  return (
    <div className="relative flex flex-col gap-5 p-4 pt-4">
      {hasBio && (
        <p className="max-w-prose text-sm leading-6 text-white/82">
          {artist.bio.summary}
        </p>
      )}

      {hasSimilarArtists && (
        <div className="flex flex-col gap-2">
          <span className="text-[0.7rem] tracking-[0.24em] text-white/45 uppercase">
            Similar Artists
          </span>
          <div className="flex flex-wrap gap-2">
            {artist.similarArtists.map((similarArtist) => {
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
          </div>
        </div>
      )}

      {artist.lastFmUrl && (
        <a
          href={artist.lastFmUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 self-start text-sm text-white/68 transition hover:text-white/90"
        >
          <ExternalLinkIcon className="h-4 w-4" />
          <span>More on Last.fm</span>
        </a>
      )}
    </div>
  );
}
