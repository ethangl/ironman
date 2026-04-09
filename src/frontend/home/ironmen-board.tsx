import { AppLink } from "@/components/app-link";
import { Avatar } from "@/components/avatar";
import { List, ListItem } from "@/components/list";
import { useIronmenBoardData } from "@/hooks/use-home-boards";
import { difficultyLabel } from "@/lib/difficulty";

export function IronmenBoard() {
  const { items: entries, loading } = useIronmenBoardData();

  return (
    <List title="True Iron Men" loading={loading} count={entries.length}>
      {entries.map((entry) => {
        const dl = difficultyLabel(entry.songDifficulty);
        return (
          <ListItem
            key={entry.id}
            className={
              entry.rank === 1
                ? "border border-yellow-500/20 bg-linear-to-r from-yellow-500/10 to-transparent"
                : undefined
            }
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                entry.rank === 1
                  ? "bg-yellow-500 text-mist-950"
                  : entry.rank === 2
                    ? "bg-mist-300 text-mist-950"
                    : entry.rank === 3
                      ? "bg-amber-700 text-foreground"
                      : "bg-white/10 text-muted-foreground"
              }`}
            >
              {entry.rank}
            </div>

            <Avatar
              id={entry.userId}
              image={entry.userImage}
              name={entry.userName}
              sizeClassName="size-8 text-3xl"
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <AppLink
                  href={`/profile/${entry.userId}`}
                  className="truncate text-sm font-medium transition hover:text-red-400"
                >
                  {entry.userName ?? "Anonymous"}
                </AppLink>
              </div>
              <AppLink
                href={`/song/${entry.trackId}`}
                className="block truncate text-xs text-muted-foreground transition hover:text-foreground"
              >
                {entry.trackName} - {entry.trackArtist}
                <span className={`ml-1.5 ${dl.color}`}>{dl.label}</span>
              </AppLink>
            </div>

            <div className="shrink-0 text-right">
              <div>
                <span className="text-xl font-bold tabular-nums">
                  {entry.count}
                </span>
                <span className="ml-1 text-xs text-muted-foreground">
                  plays
                </span>
              </div>
              <div className="text-[10px] tabular-nums text-muted-foreground">
                Score: {entry.streakScore}
              </div>
            </div>
          </ListItem>
        );
      })}
    </List>
  );
}
