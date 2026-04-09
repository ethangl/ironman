import { FC } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useSpotifyActivity } from "@/hooks/use-spotify-activity";
import { useWebPlayerActions } from "@/hooks/use-web-player";
import { Thumbnail } from "./thumbnail";

export const RecentTracks: FC = () => {
  const { recentTracks } = useSpotifyActivity();
  const { playTrack } = useWebPlayerActions();

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold">Recents</h3>
      <ScrollArea>
        <ol className="flex gap-2 w-max">
          {recentTracks.map(({ track }) => (
            <li key={track.id}>
              <Thumbnail
                description={track.albumName}
                handlePlay={() => playTrack(track)}
                name={track.name}
                src={track.albumImage}
              />
            </li>
          ))}
        </ol>
      </ScrollArea>
    </section>
  );
};
