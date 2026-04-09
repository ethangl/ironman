import { useParams } from "react-router-dom";

import { Leaderboard } from "@/components/leaderboard";
import { List, ListItem } from "@/components/list";
import { useSongStats } from "@/hooks/use-song-stats";
import { difficultyLabel } from "@/lib/difficulty";

export function SongRoute() {
  const { trackId = "" } = useParams();
  const { stats, loading } = useSongStats(trackId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-mist-500 border-t-white" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-32 text-center text-muted-foreground">
        No one has attempted this song yet.
      </div>
    );
  }

  return (
    <main className="space-y-12">
      {stats.activeCount > 0 && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-red-400">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          {stats.activeCount} streaming now
        </p>
      )}

      {stats.ironMan && (
        <div className="rounded-xl border border-yellow-500/20 bg-linear-to-r from-yellow-500/10 to-transparent p-5 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-yellow-400">
            Iron Man
          </p>
          <p className="text-xl font-bold">{stats.ironMan.name}</p>
          <p className="mt-1 text-3xl font-black tabular-nums">
            {stats.ironMan.count}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              plays
            </span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Plays", value: String(stats.totalPlays) },
          { label: "Attempts", value: String(stats.totalAttempts) },
          { label: "Users", value: String(stats.uniqueUsers) },
          { label: "Avg Streak", value: String(stats.avgStreak) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-white/5 p-4 text-center"
          >
            <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <span
          className={`text-sm font-bold uppercase tracking-wider ${difficultyLabel(stats.difficulty).color}`}
        >
          {difficultyLabel(stats.difficulty).label}
        </span>
        <span className="ml-2 text-sm text-muted-foreground">
          Difficulty ({stats.difficulty.toFixed(1)})
        </span>
      </div>

      {stats.weaknessCount > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          {stats.weaknessCount} total moments of weakness recorded
        </div>
      )}

      <Leaderboard trackId={trackId} />

      <List title="Wall of Shame" count={stats.shameList.length}>
        {stats.shameList.map((entry, index) => {
          const duration = Math.round(
            (new Date(entry.endedAt).getTime() -
              new Date(entry.startedAt).getTime()) /
              60000,
          );

          return (
            <ListItem key={`${entry.userName ?? "anonymous"}-${index}`}>
              <span className="shrink-0 text-lg">
                {index === 0 ? "💀" : "😬"}
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium">
                  {entry.userName ?? "Anonymous"}
                </span>
                <p className="text-xs text-muted-foreground">
                  Lasted {duration < 1 ? "less than a minute" : `${duration}m`}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-lg font-bold tabular-nums">
                  {entry.count}
                </span>
                <span className="ml-1 text-xs text-muted-foreground">
                  {entry.count === 1 ? "play" : "plays"}
                </span>
              </div>
            </ListItem>
          );
        })}
      </List>
    </main>
  );
}
