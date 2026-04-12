import { List, ListItem } from "@/components/list";
import { PlayableTrackCell } from "@/features/spotify/player";
import type { BangerSong } from "@shared/leaderboards";
import { Stat } from "./stat";

export function BangersBoardList({
  songs,
  loading,
}: {
  songs: BangerSong[];
  loading: boolean;
}) {
  return (
    <List title="Pure Bangers" loading={loading} count={songs.length}>
      {songs.map((song, i) => (
        <ListItem key={song.trackId}>
          <PlayableTrackCell track={song} count={i + 1}>
            <Stat>
              <span>{song.avgCount}</span>
              <span className="opacity-50">x</span>
            </Stat>
          </PlayableTrackCell>
        </ListItem>
      ))}
    </List>
  );
}
