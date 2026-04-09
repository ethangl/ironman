import { requestJson, requestOptionalJson } from "@/data/http";
import { StreakData, TrackInfo } from "@/types";

export interface PollIronmanInput {
  progressMs: number;
  trackId: string;
  isPlaying: boolean;
}

export interface PollIronmanResult {
  count: number;
}

export interface ReportWeaknessResult {
  broken: boolean;
}

export function getIronmanStatus() {
  return requestOptionalJson<StreakData>(
    "/api/ironman/status",
    undefined,
    { fallbackMessage: "Could not load ironman status." },
  );
}

export function startIronman(track: TrackInfo & { playbackStarted: boolean }) {
  return requestJson<StreakData>(
    "/api/ironman/start",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(track),
    },
    "Could not start ironman mode.",
  );
}

export function activateIronmanHardcore() {
  return requestJson<unknown>(
    "/api/ironman/hardcore",
    { method: "POST" },
    "Could not activate hardcore mode.",
  );
}

export function surrenderIronman() {
  return requestJson<unknown>(
    "/api/ironman/surrender",
    { method: "POST" },
    "Could not surrender this streak.",
  );
}

export function reportWeakness(type: string, detail?: string) {
  return requestOptionalJson<ReportWeaknessResult>(
    "/api/ironman/weakness",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, detail }),
    },
    { fallbackMessage: "Could not record weakness." },
  );
}

export function pollIronman(input: PollIronmanInput) {
  return requestJson<PollIronmanResult>(
    "/api/ironman/poll",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        progress_ms: input.progressMs,
        track_id: input.trackId,
        is_playing: input.isPlaying,
      }),
    },
    "Could not update ironman streak.",
  );
}
