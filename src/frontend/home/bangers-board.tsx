import { List, ListItem } from "@/components/list";
import { TrackCell } from "@/components/track-cell";
import type { BangerSong } from "@shared/leaderboards";
import { useBangersBoardData } from "@/hooks/use-home-boards";
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
          <TrackCell track={song} count={i + 1}>
            <Stat>
              <span>{song.avgCount}</span>
              <span className="opacity-50">x</span>
            </Stat>
          </TrackCell>
        </ListItem>
      ))}
    </List>
  );
}

export function BangersBoard() {
  const { items: songs, loading } = useBangersBoardData();
  return <BangersBoardList songs={songs} loading={loading} />;
}
