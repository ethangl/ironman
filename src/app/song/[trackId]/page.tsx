export const dynamic = "force-dynamic";

import type { Metadata } from "next";

import { Leaderboard } from "@/components/leaderboard";
import { List, ListItem } from "@/components/list";
import { Navbar } from "@/components/navbar";
import { difficultyLabel } from "@/lib/difficulty";
import { getCurrentMilestone } from "@/lib/milestones";
import { getSongStats } from "./get-song-stats";

export default async function SongPage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;
  const stats = await getSongStats(trackId);

  if (!stats) {
    return (
      <div className="min-h-screen bg-mist-950">
        <Navbar />
        <div className="py-32 text-center text-muted-foreground">
          No one has attempted this song yet.
        </div>
      </div>
    );
  }

  const ironManMilestone = stats.ironMan
    ? getCurrentMilestone(stats.ironMan.count)
    : null;

  return (
    <main className="space-y-12">
      {stats.activeCount > 0 && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-red-400">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          {stats.activeCount} streaming now
        </p>
      )}

      {stats.ironMan && (
        <div className="rounded-xl bg-linear-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 p-5 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-2">
            Iron Man
          </p>
          <p className="text-xl font-bold">{stats.ironMan.name}</p>
          <p className="text-3xl font-black tabular-nums mt-1">
            {ironManMilestone && (
              <span className="mr-2">{ironManMilestone.badge}</span>
            )}
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
            <div className="text-xs text-muted-foreground mt-1">
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
        <span className="text-sm text-muted-foreground ml-2">
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
        {stats.shameList.map((s, i) => {
          const duration = Math.round(
            (new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) /
              60000,
          );
          return (
            <ListItem key={i}>
              <span className="text-lg shrink-0">{i === 0 ? "💀" : "😬"}</span>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm">
                  {s.userName ?? "Anonymous"}
                </span>
                <p className="text-xs text-muted-foreground">
                  Lasted {duration < 1 ? "less than a minute" : `${duration}m`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-lg font-bold tabular-nums">
                  {s.count}
                </span>
                <span className="ml-1 text-xs text-muted-foreground">
                  {s.count === 1 ? "play" : "plays"}
                </span>
              </div>
            </ListItem>
          );
        })}
      </List>
    </main>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ trackId: string }>;
}): Promise<Metadata> {
  const { trackId } = await params;
  const stats = await getSongStats(trackId);

  if (!stats) return { title: "Song — ironman.fm" };

  const title = `${stats.trackName} by ${stats.trackArtist} — ironman.fm`;
  const description = stats.ironMan
    ? `${stats.ironMan.name} is the Iron Man with ${stats.ironMan.count} plays. ${stats.totalPlays} total plays across ${stats.uniqueUsers} users.`
    : `${stats.totalPlays} total plays across ${stats.uniqueUsers} users. No Iron Man yet.`;

  return {
    title,
    description,
    openGraph: { title, description, siteName: "ironman.fm" },
  };
}
