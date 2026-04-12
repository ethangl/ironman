import { FC } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Thumbnail } from "@/frontend/home/thumbnail";
import { useSpotifyActivity } from "@/hooks/use-spotify-activity";
import { useWebPlayerActions } from "@/hooks/use-web-player";

export const RecentTracks: FC = () => {
  const { recentTracks } = useSpotifyActivity();
  const { playTrack } = useWebPlayerActions();

  return (
    <section className="-mx-6 space-y-4">
      <h3 className="mx-6 text-lg font-bold">Recents</h3>
      <ScrollArea>
        <ol className="flex gap-2 px-3 w-max">
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
