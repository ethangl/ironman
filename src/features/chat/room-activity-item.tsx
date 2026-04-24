import {
  ListPlusIcon,
  LogInIcon,
  LogOutIcon,
  Music2Icon,
} from "lucide-react";

import { AlbumArt } from "@/components/album-art";
import { Avatar } from "@/components/avatar";
import { cn } from "@/lib/utils";
import type {
  RoomActivityEvent,
  RoomActivityTrack,
} from "../rooms/client/room-types";

function formatActivityTime(createdAt: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(createdAt));
}

function ActivityTrackSummary({ track }: { track: RoomActivityTrack }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <AlbumArt className="size-9 rounded-xl" src={track.trackImageUrl} />
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{track.trackName}</div>
        <div className="truncate text-xs text-muted-foreground">
          {track.trackArtists.join(", ")}
        </div>
      </div>
    </div>
  );
}

export function RoomActivityItem({ event }: { event: RoomActivityEvent }) {
  const actorName = event.actor?.name ?? "Someone";
  const time = formatActivityTime(event.createdAt);

  if (event.kind === "chat_message") {
    return (
      <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-xl bg-section-color/5 p-2">
        <Avatar
          id={event.actor?.userId ?? event._id}
          image={event.actor?.image ?? null}
          name={event.actor?.name ?? null}
          sizeClassName="size-8 text-xl"
        />
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-sm font-medium">{actorName}</span>
            <time className="shrink-0 text-[11px] text-muted-foreground">
              {time}
            </time>
          </div>
          <p className="whitespace-pre-wrap wrap-break-word text-sm leading-snug">
            {event.body}
          </p>
        </div>
      </li>
    );
  }

  if (event.kind === "user_entered" || event.kind === "user_left") {
    const entered = event.kind === "user_entered";

    return (
      <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-xl bg-section-color/5 p-2">
        <div
          className={cn(
            "flex size-8 items-center justify-center rounded-full",
            entered
              ? "bg-emerald-400/10 text-emerald-200"
              : "bg-rose-400/10 text-rose-200",
          )}
        >
          {entered ? <LogInIcon /> : <LogOutIcon />}
        </div>
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-sm font-medium">{actorName}</span>
            <time className="shrink-0 text-[11px] text-muted-foreground">
              {time}
            </time>
          </div>
          <p className="text-sm text-muted-foreground">
            {entered ? "entered the room" : "left the room"}
          </p>
        </div>
      </li>
    );
  }

  const isQueueAdded = event.kind === "queue_added";

  return (
    <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-xl bg-section-color/5 p-2">
      <div
        className={cn(
          "flex size-8 items-center justify-center rounded-full",
          isQueueAdded
            ? "bg-emerald-400/10 text-emerald-200"
            : "bg-sky-400/10 text-sky-200",
        )}
      >
        {isQueueAdded ? <ListPlusIcon /> : <Music2Icon />}
      </div>
      <div className="min-w-0 space-y-1.5">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-xs text-muted-foreground">
            {isQueueAdded ? `${actorName} added` : "Now playing"}
          </span>
          <time className="shrink-0 text-[11px] text-muted-foreground">
            {time}
          </time>
        </div>
        <ActivityTrackSummary track={event.track} />
      </div>
    </li>
  );
}
