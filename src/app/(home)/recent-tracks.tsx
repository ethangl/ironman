import { FC } from "react";

import { useSpotifyActivity } from "@/hooks/use-spotify-activity";
import { useWebPlayerActions } from "@/hooks/use-web-player";
import { Thumbnail } from "./thumbnail";

export const RecentTracks: FC = () => {
  const { recentTracks } = useSpotifyActivity();
  const { playTrack } = useWebPlayerActions();

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold">Recents</h3>
      <div className="max-w-full -mb-8 overflow-x-auto pb-8">
        <ol className="flex gap-2">
          {recentTracks.map(({ track }) => (
            <li key={track.id}>
              <Thumbnail
                description={track.albumName}
                name={track.name}
                src={track.albumImage}
                onClick={() => playTrack(track)}
              />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
