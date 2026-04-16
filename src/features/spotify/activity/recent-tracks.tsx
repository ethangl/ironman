import { FC } from "react";

import { Section } from "@/components/section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWebPlayerActions } from "@/features/spotify/player";
import { Thumbnail } from "./thumbnail";
import { useSpotifyActivity } from "./use-spotify-activity";

export const RecentTracks: FC = () => {
  const { recentTracks } = useSpotifyActivity();
  const { playTrack } = useWebPlayerActions();

  return (
    <Section title="Your Recent Tracks" color="--color-emerald-400">
      <ScrollArea>
        <ol className="flex gap-4 p-4 w-max">
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
    </Section>
  );
};
