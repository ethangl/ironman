import { List, ListItem } from "@/components/list";
import { TrackCell } from "@/components/track-cell";
import { useBangersBoardData } from "@/hooks/use-home-boards";

export function BangersBoard() {
  const { items: songs, loading } = useBangersBoardData();

  return (
    <List title="Pure Bangers" loading={loading} count={songs.length}>
      {songs.map((song, i) => (
        <ListItem key={song.trackId}>
          <TrackCell track={song} count={i + 1} />
        </ListItem>
      ))}
    </List>
  );
}
