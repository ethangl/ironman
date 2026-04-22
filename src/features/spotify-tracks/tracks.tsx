import { FC, ReactNode } from "react";

import { List, ListItem } from "@/components/list";
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import type { SpotifyTrack } from "@/features/spotify-client/types";
import { TrackCell } from "./track-cell";

export type TracksProps = {
  action?: ReactNode;
  paginate?: ReactNode;
  renderTrackAction?: (track: SpotifyTrack) => ReactNode;
  tracks: SpotifyTrack[];
  title: string;
};

export const Tracks: FC<TracksProps> = ({
  action,
  paginate,
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
        <SectionTitle>
          {title}
          {action}
        </SectionTitle>
      </SectionHeader>
      <SectionContent>
        <List count={tracks.length}>
          {tracks.map((song) => (
            <ListItem key={song.id}>
              <TrackCell track={song}>{renderTrackAction?.(song)}</TrackCell>
            </ListItem>
          ))}
          {paginate}
        </List>
      </SectionContent>
    </Section>
  );
};
