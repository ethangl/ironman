import { HeartIcon, SpeakerIcon } from "lucide-react";

import { BackgroundOverlay } from "@/components/background-overlay";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RoomSummary } from "../client/room-types";
import { useRooms } from "../runtime/rooms-provider";
import { RoomLink } from "./room-link";

export function RoomCard({
  active,
  roomSummary,
}: {
  active: boolean;
  roomSummary: RoomSummary;
}) {
  const { followRoom, unfollowRoom } = useRooms();
  const hasRoomRole = !!roomSummary.viewerMembership;
  const isFollowed = roomSummary.viewerFollowsRoom;

  return (
    <article
      className={cn(
        "hover:bg-red-400/10 flex items-center hover:ring ring-red-400 relative rounded-2xl shadow-xs transition-all",
        active && "ring-1 ring-red-400",
      )}
    >
      <BackgroundOverlay />
      <RoomLink
        roomId={roomSummary.room._id}
        className="flex flex-1 gap-4 items-center p-4"
      >
        <SpeakerIcon />
        <h3 className="flex-1 font-semibold text-2xl truncate">
          {roomSummary.room.name}
        </h3>
        {hasRoomRole && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-medium text-emerald-200">
            {roomSummary.viewerMembership?.role}
          </span>
        )}
      </RoomLink>
      {!hasRoomRole && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute inset-0 left-auto my-auto mr-3"
          onClick={() =>
            isFollowed
              ? void unfollowRoom(roomSummary.room._id)
              : void followRoom(roomSummary.room._id)
          }
        >
          <HeartIcon
            className={isFollowed ? "fill-current text-red-400" : undefined}
          />
        </Button>
      )}
    </article>
  );
}
