"use client";

import { useState, useCallback, useEffect, useRef, type RefObject } from "react";
import { StreakData } from "@/types";
import { EnforcementEngine, WeaknessEvent } from "./enforcement-engine";
import { StreakCounter } from "./streak-counter";
import { SurrenderButton } from "./surrender-button";
import { Leaderboard } from "./leaderboard";
import { WeaknessLog } from "./weakness-log";
import { ShareButton } from "./share-button";
import { FellowIronmen } from "./fellow-ironmen";
import { MilestoneToast } from "./milestone-toast";
import { justHitMilestone, type Milestone } from "@/lib/milestones";
import { PlayProgress } from "./play-progress";
import { PlaybackControls } from "./playback-controls";
import { type SdkPlaybackState } from "./web-player";

export function IronmanPanel({
  streak: initialStreak,
  accessToken,
  onSurrender,
  onTokenExpired,
  sdkState,
  playerRef,
}: {
  streak: StreakData;
  accessToken: string;
  onSurrender: () => void;
  onTokenExpired?: () => void;
  sdkState?: SdkPlaybackState | null;
  playerRef?: RefObject<any>;
}) {
  const [count, setCount] = useState(initialStreak.count);
  const [weaknesses, setWeaknesses] = useState<WeaknessEvent[]>([]);
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [progressMs, setProgressMs] = useState(0);
  const [durationMs, setDurationMs] = useState(initialStreak.trackDuration);
  const prevCountRef = useRef(initialStreak.count);
  const sdkActive = !!(sdkState && sdkState.trackId === initialStreak.trackId);

  // Load existing weaknesses on mount
  useEffect(() => {
    fetch("/api/ironman/weakness")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setWeaknesses(data);
      })
      .catch(() => {});
  }, []);

  const handleCountUpdate = useCallback((newCount: number) => {
    const hit = justHitMilestone(prevCountRef.current, newCount);
    if (hit) setActiveMilestone(hit);
    prevCountRef.current = newCount;
    setCount(newCount);
  }, []);

  const handleProgress = useCallback((p: number, d: number) => {
    setProgressMs(p);
    setDurationMs(d);
  }, []);

  const handleWeakness = useCallback((event: WeaknessEvent) => {
    setWeaknesses((prev) => [event, ...prev]);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {activeMilestone && (
        <MilestoneToast
          milestone={activeMilestone}
          onDismiss={() => setActiveMilestone(null)}
        />
      )}

      <EnforcementEngine
        streak={initialStreak}
        accessToken={accessToken}
        onCountUpdate={handleCountUpdate}
        onProgress={handleProgress}
        onWeakness={handleWeakness}
        onBroken={onSurrender}
        onTokenExpired={onTokenExpired}
        sdkState={sdkState}
      />

      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
        </span>
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">
          Ironman Mode Active
        </span>
        {initialStreak.hardcore && (
          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-300">
            Hardcore
          </span>
        )}
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

      <a href={`/song/${initialStreak.trackId}`} className="text-center hover:opacity-80 transition">
        <h2 className="text-2xl font-bold">{initialStreak.trackName}</h2>
        <p className="text-zinc-400">{initialStreak.trackArtist}</p>
      </a>

      <StreakCounter count={count} />

      <PlayProgress
        progressMs={sdkActive ? sdkState!.position : progressMs}
        durationMs={sdkActive ? sdkState!.duration : durationMs}
      />

      <PlaybackControls
        accessToken={accessToken}
        player={playerRef ?? null}
        isSdkActive={sdkActive}
        paused={sdkActive ? sdkState!.paused : undefined}
      />

      <FellowIronmen trackId={initialStreak.trackId} />

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
