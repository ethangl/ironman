import { FC, ReactNode } from "react";

import { List, ListItem } from "@/components/list";
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { SpotifyTrack } from "@/types";
import { TrackCell } from "./track-cell";

export type TracksProps = {
  renderTrackAction?: (track: SpotifyTrack) => ReactNode;
  tracks: SpotifyTrack[];
  title: string;
};

export const Tracks: FC<TracksProps> = ({
  renderTrackAction,
  title,
  tracks,
}) => {
  if (tracks.length === 0) {
    return null;
  }

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>{title}</SectionTitle>
      </SectionHeader>
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
    </Section>
  );
};
