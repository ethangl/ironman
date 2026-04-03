export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { Leaderboard } from "@/components/leaderboard";
import { LockInButton } from "@/components/lock-in-button";
import { getCurrentMilestone } from "@/lib/milestones";
import { computeSongDifficulty, difficultyLabel } from "@/lib/difficulty";
import type { Metadata } from "next";

async function getSongStats(trackId: string) {
  const streaks = await prisma.streak.findMany({
    where: { trackId },
    include: { user: { select: { name: true } } },
  });

  if (streaks.length === 0) return null;

  const sample = streaks[0];
  const totalPlays = streaks.reduce((sum, s) => sum + s.count, 0);
  const totalAttempts = streaks.length;
  const uniqueUsers = new Set(streaks.map((s) => s.userId)).size;
  const activeCount = streaks.filter((s) => s.active).length;
  const avgStreak =
    totalAttempts > 0 ? Math.round(totalPlays / totalAttempts) : 0;

  // Best streak
  const best = streaks.reduce(
    (max, s) => (s.count > max.count ? s : max),
    streaks[0]
  );

  // Weakness count across all streaks for this song
  const weaknessCount = await prisma.weakness.count({
    where: { streakId: { in: streaks.map((s) => s.id) } },
  });

  // Wall of shame — ended streaks sorted by lowest count
  const shameList = streaks
    .filter((s) => !s.active && s.endedAt != null)
    .sort((a, b) => a.count - b.count)
    .slice(0, 5)
    .map((s) => ({
      userName: s.user.name,
      count: s.count,
      startedAt: s.startedAt.toISOString(),
      endedAt: s.endedAt!.toISOString(),
    }));

  const difficulty = computeSongDifficulty(
    sample.trackDuration,
    totalAttempts >= 3
      ? {
          weaknessRate: weaknessCount / Math.max(totalPlays, 1),
          avgCount: totalPlays / totalAttempts,
          totalAttempts,
        }
      : undefined,
  );

  return {
    trackName: sample.trackName,
    trackArtist: sample.trackArtist,
    trackImage: sample.trackImage,
    trackDuration: sample.trackDuration,
    totalPlays,
    totalAttempts,
    uniqueUsers,
    activeCount,
    avgStreak,
    weaknessCount,
    difficulty,
    ironMan: best.count > 0
      ? { name: best.user.name, count: best.count }
      : null,
    shameList,
  };
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

export default async function SongPage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;
  const stats = await getSongStats(trackId);

  if (!stats) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="py-32 text-center text-zinc-400">
          No one has attempted this song yet.
        </div>
      </div>
    );
  }

  const ironManMilestone = stats.ironMan
    ? getCurrentMilestone(stats.ironMan.count)
    : null;

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-xl px-4 py-8">
        {/* Song header */}
        <div className="flex items-center gap-4 mb-8">
          {stats.trackImage && (
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-red-500/20 blur-lg" />
              <img
                src={stats.trackImage}
                alt=""
                className="relative h-24 w-24 rounded-xl object-cover"
              />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{stats.trackName}</h1>
            <p className="text-zinc-400">{stats.trackArtist}</p>
            {stats.activeCount > 0 && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                {stats.activeCount} streaming now
              </p>
            )}
          </div>
        </div>

        {/* Iron Man */}
        {stats.ironMan && (
          <div className="mb-8 rounded-xl bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-2">
              Iron Man
            </p>
            <p className="text-xl font-bold">{stats.ironMan.name}</p>
            <p className="text-3xl font-black tabular-nums mt-1">
              {ironManMilestone && (
                <span className="mr-2">{ironManMilestone.badge}</span>
              )}
              {stats.ironMan.count}
              <span className="ml-2 text-sm font-normal text-zinc-500">
                plays
              </span>
            </p>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
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
              <div className="text-2xl font-bold tabular-nums">
                {stat.value}
              </div>
              <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Difficulty */}
        <div className="mb-8 text-center">
          <span className={`text-sm font-bold uppercase tracking-wider ${difficultyLabel(stats.difficulty).color}`}>
            {difficultyLabel(stats.difficulty).label}
          </span>
          <span className="text-sm text-zinc-500 ml-2">
            Difficulty ({stats.difficulty.toFixed(1)})
          </span>
        </div>

        {stats.weaknessCount > 0 && (
          <div className="mb-8 text-center text-sm text-zinc-500">
            {stats.weaknessCount} total moments of weakness recorded
          </div>
        )}

        {/* Leaderboard */}
        <Leaderboard trackId={trackId} title="Rankings" />

        {/* Wall of Shame */}
        {stats.shameList.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Wall of Shame</h3>
            <div className="space-y-2">
              {stats.shameList.map((s, i) => {
                const duration = Math.round(
                  (new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60000
                );
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl bg-white/5 p-3"
                  >
                    <span className="text-lg shrink-0">
                      {i === 0 ? "💀" : "😬"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm">
                        {s.userName ?? "Anonymous"}
                      </span>
                      <p className="text-xs text-zinc-500">
                        Lasted {duration < 1 ? "less than a minute" : `${duration}m`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-bold tabular-nums">
                        {s.count}
                      </span>
                      <span className="ml-1 text-xs text-zinc-500">
                        {s.count === 1 ? "play" : "plays"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <LockInButton
            trackId={trackId}
            trackName={stats.trackName}
            trackArtist={stats.trackArtist}
            trackImage={stats.trackImage}
            trackDuration={stats.trackDuration}
          />
          <Link
            href={`/challenge/${trackId}`}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition"
          >
            Challenge someone to this song
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
