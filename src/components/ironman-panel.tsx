"use client";

import { useState, useCallback, useEffect } from "react";
import { StreakData } from "@/types";
import { EnforcementEngine, WeaknessEvent } from "./enforcement-engine";
import { StreakCounter } from "./streak-counter";
import { SurrenderButton } from "./surrender-button";
import { Leaderboard } from "./leaderboard";
import { WeaknessLog } from "./weakness-log";
import { ShareButton } from "./share-button";

export function IronmanPanel({
  streak: initialStreak,
  accessToken,
  onSurrender,
}: {
  streak: StreakData;
  accessToken: string;
  onSurrender: () => void;
}) {
  const [count, setCount] = useState(initialStreak.count);
  const [weaknesses, setWeaknesses] = useState<WeaknessEvent[]>([]);

  // Load existing weaknesses on mount
  useEffect(() => {
    fetch("/api/ironman/weakness")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setWeaknesses(data);
      })
      .catch(() => {});
  }, []);

  const handleWeakness = useCallback((event: WeaknessEvent) => {
    setWeaknesses((prev) => [event, ...prev]);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <EnforcementEngine
        streak={initialStreak}
        accessToken={accessToken}
        onCountUpdate={setCount}
        onWeakness={handleWeakness}
      />

      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
        </span>
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">
          Ironman Mode Active
        </span>
      </div>

      {initialStreak.trackImage && (
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-red-500/20 blur-xl" />
          <img
            src={initialStreak.trackImage}
            alt=""
            className="relative h-48 w-48 rounded-2xl object-cover shadow-2xl"
          />
        </div>
      )}

      <div className="text-center">
        <h2 className="text-2xl font-bold">{initialStreak.trackName}</h2>
        <p className="text-zinc-400">{initialStreak.trackArtist}</p>
      </div>

      <StreakCounter count={count} />

      <div className="flex items-center gap-3 pt-4">
        <ShareButton
          trackName={initialStreak.trackName}
          trackArtist={initialStreak.trackArtist}
          trackId={initialStreak.trackId}
          count={count}
          isIronMan={false}
        />
        <SurrenderButton onSurrender={onSurrender} />
      </div>

      <WeaknessLog events={weaknesses} />

      <div className="w-full max-w-md pt-4">
        <Leaderboard
          trackId={initialStreak.trackId}
          title="Leaderboard"
          liveCount={count}
        />
      </div>
    </div>
  );
}
