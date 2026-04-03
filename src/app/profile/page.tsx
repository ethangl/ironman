"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { getCurrentMilestone } from "@/lib/milestones";

interface ProfileData {
  user: { name: string; image: string | null };
  stats: {
    totalPlays: number;
    totalStreaks: number;
    uniqueSongs: number;
    weaknessCount: number;
  };
  bestStreak: {
    trackName: string;
    trackArtist: string;
    trackImage: string | null;
    trackId: string;
    count: number;
  } | null;
  activeStreak: {
    trackName: string;
    trackArtist: string;
    trackImage: string | null;
    trackId: string;
    count: number;
  } | null;
  history: {
    id: string;
    trackId: string;
    trackName: string;
    trackArtist: string;
    trackImage: string | null;
    count: number;
    active: boolean;
    startedAt: string;
    endedAt: string | null;
  }[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="py-32 text-center text-zinc-400">
          Sign in to see your profile.
        </div>
      </div>
    );
  }

  const bestMilestone = data.bestStreak
    ? getCurrentMilestone(data.bestStreak.count)
    : null;

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {data.user.image ? (
            <img
              src={data.user.image}
              alt=""
              className="h-16 w-16 rounded-full"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-white/10" />
          )}
          <div>
            <h1 className="text-2xl font-bold">{data.user.name}</h1>
            <p className="text-sm text-zinc-400">
              {bestMilestone
                ? `${bestMilestone.badge} ${bestMilestone.label}`
                : "No milestones yet"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
          {[
            { label: "Total Plays", value: data.stats.totalPlays },
            { label: "Streaks", value: data.stats.totalStreaks },
            { label: "Songs", value: data.stats.uniqueSongs },
            { label: "Weaknesses", value: data.stats.weaknessCount },
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

        {/* Best Streak */}
        {data.bestStreak && data.bestStreak.count > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3">
              Best Streak
            </h2>
            <a
              href={`/leaderboard/${data.bestStreak.trackId}`}
              className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 p-4 hover:bg-yellow-500/5 transition"
            >
              {data.bestStreak.trackImage && (
                <img
                  src={data.bestStreak.trackImage}
                  alt=""
                  className="h-12 w-12 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {data.bestStreak.trackName}
                </p>
                <p className="text-sm text-zinc-400 truncate">
                  {data.bestStreak.trackArtist}
                </p>
              </div>
              <div className="text-right">
                {bestMilestone && (
                  <span className="text-sm mr-1">{bestMilestone.badge}</span>
                )}
                <span className="text-2xl font-bold tabular-nums">
                  {data.bestStreak.count}
                </span>
                <span className="ml-1 text-xs text-zinc-500">plays</span>
              </div>
            </a>
          </div>
        )}

        {/* Streak History */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3">
            Streak History
          </h2>
          {data.history.length === 0 ? (
            <p className="text-center py-8 text-zinc-500">
              No streaks yet. Lock in to start your first.
            </p>
          ) : (
            <div className="space-y-2">
              {data.history.map((s) => {
                const milestone = getCurrentMilestone(s.count);
                return (
                  <a
                    key={s.id}
                    href={`/leaderboard/${s.trackId}`}
                    className="flex items-center gap-3 rounded-xl bg-white/5 p-3 hover:bg-white/10 transition"
                  >
                    {s.trackImage ? (
                      <img
                        src={s.trackImage}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-white/10" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-sm">
                          {s.trackName}
                        </span>
                        {s.active && (
                          <span className="shrink-0 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] text-red-400">
                              LIVE
                            </span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">
                        {s.trackArtist} &middot; {formatDate(s.startedAt)}
                        {s.endedAt && ` — ${formatDate(s.endedAt)}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {milestone && (
                        <span className="text-sm mr-1">{milestone.badge}</span>
                      )}
                      <span className="text-lg font-bold tabular-nums">
                        {s.count}
                      </span>
                      <span className="ml-1 text-xs text-zinc-500">plays</span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <a
            href="/dashboard"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition"
          >
            Back to dashboard
          </a>
        </div>
      </main>
    </div>
  );
}
