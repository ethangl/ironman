import { FC } from "react";

import { List, ListItem } from "@/components/list";
import { Section, SectionProps } from "@/components/section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Thumbnail } from "@/features/spotify/activity/thumbnail";
import { SpotifyTrack } from "@/types";
import { useWebPlayerActions } from "../player";
import { TrackCell } from "./track-cell";

export type TracksProps = SectionProps & {
  display?: "list" | "thumbnails";
  tracks: SpotifyTrack[];
};

export const Tracks: FC<TracksProps> = ({
  display = "list",
  tracks,
  ...props
}) => {
  const { playTrack } = useWebPlayerActions();

  if (tracks.length === 0) {
    return null;
  }

  return (
    <Section {...props}>
      {display === "list" ? (
        <List count={tracks.length} className="p-4">
          {tracks.map((song, i) => (
            <ListItem key={song.id}>
              <TrackCell count={i + 1} track={song} />
            </ListItem>
          ))}
        </List>
      ) : (
        <ScrollArea>
          <ol className="flex gap-4 p-4 w-max">
            {tracks.map((track) => (
              <li key={track.id}>
                <Thumbnail
                  description={track.artist}
                  handlePlay={() => playTrack(track)}
                  name={track.name}
                  src={track.albumImage}
                />
              </li>
            ))}
          </ol>
        </ScrollArea>
      )}
    </Section>
  );
};
