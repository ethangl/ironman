"use client";

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function PlayProgress({
  progressMs,
  durationMs,
}: {
  progressMs: number;
  durationMs: number;
}) {
  const pct = durationMs > 0 ? (progressMs / durationMs) * 100 : 0;

  return (
    <div className="w-full max-w-md">
      <div className="relative h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-red-500 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-xs tabular-nums text-zinc-500">
        <span>{formatTime(progressMs)}</span>
        <span>{formatTime(durationMs)}</span>
      </div>
    </div>
  );
}
