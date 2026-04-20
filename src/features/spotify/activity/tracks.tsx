import { FC, ReactNode } from "react";

import { List, ListItem } from "@/components/list";
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { Thumbnail } from "@/features/spotify/activity/thumbnail";
import { SpotifyTrack } from "@/types";
import { useWebPlayerActions } from "../player";
import { TrackCell } from "./track-cell";

export type TracksProps = {
  display?: "list" | "thumbnails";
  renderTrackAction?: (track: SpotifyTrack) => ReactNode;
  tracks: SpotifyTrack[];
  title: string;
};

export const Tracks: FC<TracksProps> = ({
  display = "list",
  renderTrackAction,
  title,
  tracks,
}) => {
  const { playTrack } = useWebPlayerActions();

  if (tracks.length === 0) {
    return null;
  }

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>{title}</SectionTitle>
      </SectionHeader>
      {display === "list" ? (
        <SectionContent>
          <List count={tracks.length}>
            {tracks.map((song, i) => (
              <ListItem key={song.id}>
                <TrackCell count={i + 1} track={song}>
                  {renderTrackAction?.(song)}
                </TrackCell>
              </ListItem>
            ))}
          </List>
        </SectionContent>
      ) : (
        <div className="overflow-x-scroll scrollbar-none">
          <SectionContent className="flex gap-4 w-max">
            {tracks.map((track) => (
              <Thumbnail
                key={track.id}
                description={track.artist}
                handlePlay={() => playTrack(track)}
                name={track.name}
                src={track.albumImage}
              />
            ))}
          </SectionContent>
        </div>
      )}
    </Section>
  );
};
