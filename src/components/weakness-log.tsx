"use client";

import type { WeaknessEvent } from "./enforcement-engine";

const labels: Record<string, string> = {
  paused: "Paused the music",
  quit: "Left Spotify",
  wrong_song: "Tried to play another song",
};

function timeAgo(dateStr: string) {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function WeaknessLog({ events }: { events: WeaknessEvent[] }) {
  if (events.length === 0) return null;

  return (
    <div className="w-full max-w-md">
      <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3">
        Moments of Weakness
      </h3>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {events.map((e) => (
          <div
            key={e.id}
            className="flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm"
          >
            <span className="shrink-0 mt-0.5">
              {e.type === "paused" && "⏸"}
              {e.type === "quit" && "🚪"}
              {e.type === "wrong_song" && "🎵"}
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-zinc-300">{labels[e.type]}</span>
              {e.detail && (
                <span className="block truncate text-xs text-zinc-500">
                  {e.detail}
                </span>
              )}
            </div>
            <span className="shrink-0 text-xs text-zinc-600">
              {timeAgo(e.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
