import Link from "next/link";

import { TrackInfo } from "@/types";

export function TrackCell({
  track,
  subtitle,
}: {
  track: TrackInfo;
  subtitle?: React.ReactNode;
}) {
  return (
    <>
      {track.trackImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={track.trackImage}
          alt=""
          className="h-10 w-10 rounded-lg object-cover"
        />
      ) : (
        <div className="h-10 w-10 rounded-lg bg-white/10" />
      )}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">
          <Link
            href={`/song/${track.trackId}`}
            className="hover:text-foreground transition"
          >
            {track.trackName}
          </Link>
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {track.trackArtist}
        </p>
        {subtitle}
      </div>
    </>
  );
}
