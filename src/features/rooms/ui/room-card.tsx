import { HeartIcon, SpeakerIcon } from "lucide-react";

import { ListItem } from "@/components/list";
import { Button } from "@/components/ui/button";
import type { RoomSummary } from "../client/room-types";
import { useRooms } from "../runtime/rooms-provider";
import { RoomLink } from "./room-link";

export function RoomCard({ roomSummary }: { roomSummary: RoomSummary }) {
  const { followRoom, unfollowRoom } = useRooms();
  const hasRoomRole = !!roomSummary.viewerMembership;
  const isFollowed = roomSummary.viewerFollowsRoom;

  return (
    <ListItem>
      <SpeakerIcon />
      <RoomLink roomId={roomSummary.room._id}>
        <h3 className="font-semibold text-2xl truncate">
          {roomSummary.room.name}
        </h3>
      </RoomLink>
      {hasRoomRole ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-medium text-emerald-200">
          {roomSummary.viewerMembership?.role}
        </span>
      ) : (
        <Button
          size="icon"
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
    </ListItem>
  );
}
