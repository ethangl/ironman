import { List, ListItem } from "@/components/list";
import { TrackCell } from "@/components/track-cell";
import { useBrutalityBoardData } from "@/hooks/use-home-boards";

export function BrutalityBoard() {
  const { items: songs, loading } = useBrutalityBoardData();

  if (!loading && songs.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No brutality data yet.
      </p>
    );
  }

  return (
    <List title="Legacies of Brutality" loading={loading} count={songs.length}>
      {songs.map((song, i) => (
        <ListItem key={song.trackId}>
          <span className="w-6 text-center text-sm font-bold text-muted-foreground">
            {i + 1}
          </span>
          <TrackCell track={song} />
        </ListItem>
      ))}
    </List>
  );
}
