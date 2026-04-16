import { List, ListItem } from "@/components/list";
import { Section } from "@/components/section";
import type { HellscapeSong } from "@shared/leaderboards";
import { TrackCell } from "../spotify/activity/track-cell";

export function BrutalityBoardList({
  songs,
  loading,
}: {
  songs: HellscapeSong[];
  loading: boolean;
}) {
  if (!loading && songs.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No brutality data yet.
      </p>
    );
  }

  return (
    <Section title="One Battle After Another" color="--color-red-400">
      <List loading={loading} count={songs.length} className="p-4">
        {songs.map((song, i) => (
          <ListItem key={song.trackId}>
            <TrackCell track={song} count={i + 1} />
          </ListItem>
        ))}
      </List>
    </Section>
  );
}
