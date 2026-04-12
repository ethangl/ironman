import { List, ListItem } from "@/components/list";
import { TrackCell } from "@/components/track-cell";
import type { HellscapeSong } from "@shared/leaderboards";
import { useBrutalityBoardData } from "@/hooks/use-home-boards";

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
    <List title="Legacies of Brutality" loading={loading} count={songs.length}>
      {songs.map((song, i) => (
        <ListItem key={song.trackId}>
          <TrackCell track={song} count={i + 1} />
        </ListItem>
      ))}
    </List>
  );
}

export function BrutalityBoard() {
  const { items: songs, loading } = useBrutalityBoardData();
  return <BrutalityBoardList songs={songs} loading={loading} />;
}
