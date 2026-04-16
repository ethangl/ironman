import { List, ListItem } from "@/components/list";
import { Section } from "@/components/section";
import type { BangerSong } from "@shared/leaderboards";
import { TrackCell } from "../spotify/activity/track-cell";
import { Stat } from "./stat";

export function BangersBoardList({
  songs,
  loading,
}: {
  songs: BangerSong[];
  loading: boolean;
}) {
  return (
    <Section title="Certified Bangers" color="--color-red-400">
      <List loading={loading} count={songs.length} className="p-4">
        {songs.map((song, i) => (
          <ListItem key={song.trackId}>
            <TrackCell track={song} count={i + 1}>
              <Stat>
                <span>{song.avgCount}</span>
                <span className="opacity-50">x</span>
              </Stat>
            </TrackCell>
          </ListItem>
        ))}
      </List>
    </Section>
  );
}
