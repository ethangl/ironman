"use client";

import { List, ListItem } from "@/components/list";
import type { WeaknessEvent } from "@/components/player/enforcement-engine";

const labels: Record<string, string> = {
  paused: "Paused the music",
  quit: "Left Spotify",
  wrong_song: "Tried to play another song",
};

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function WeaknessLog({ events }: { events: WeaknessEvent[] }) {
  if (events.length === 0) return null;

  return (
    <List title="Moments of Weakness" loading={false} count={events.length}>
      {events.map((e) => (
        <ListItem key={e.id}>
          <span className="shrink-0 mt-0.5">
            {e.type === "paused" && "⏸"}
            {e.type === "quit" && "🚪"}
            {e.type === "wrong_song" && "🎵"}
          </span>
          <div className="flex-1 min-w-0">
            <span>{labels[e.type]}</span>
            {e.detail && (
              <span className="block truncate text-xs text-muted-foreground">
                {e.detail}
              </span>
            )}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {timeAgo(e.createdAt)}
          </span>
        </ListItem>
      ))}
    </List>
  );
}
