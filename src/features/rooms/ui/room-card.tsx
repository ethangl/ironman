import { RadioTowerIcon, SparklesIcon } from "lucide-react";

import { AppLink } from "@/components/app-link";
import { BackgroundOverlay } from "@/components/background-overlay";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RoomSummary } from "../client/room-types";
import { useRooms } from "../runtime/rooms-provider";

export function RoomCard({
  active,
  roomSummary,
}: {
  active: boolean;
  roomSummary: RoomSummary;
}) {
  const { joinRoom, selectActiveRoom } = useRooms();
  const isJoined = !!roomSummary.viewerMembership;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[2rem] px-5 py-4",
        active && "ring-1 ring-emerald-300/40",
      )}
    >
      <BackgroundOverlay className="rounded-[2rem]" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {roomSummary.room.visibility}
            </p>
            <h3 className="truncate text-xl font-semibold">
              {roomSummary.room.name}
            </h3>
          </div>
          {isJoined ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-medium text-emerald-200">
              <SparklesIcon className="size-3" />
              {roomSummary.viewerMembership?.role}
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={isJoined ? "secondary" : "default"}
            onClick={() =>
              isJoined
                ? selectActiveRoom(roomSummary.room._id)
                : void joinRoom(roomSummary.room._id)
            }
          >
            <RadioTowerIcon />
            {active ? "Listening now" : isJoined ? "Listen here" : "Join room"}
          </Button>
          <Button
            variant="ghost"
            nativeButton={false}
            render={<AppLink href={`/rooms/${roomSummary.room._id}`} />}
          >
            Open room
          </Button>
        </div>
      </div>
    </article>
  );
}
