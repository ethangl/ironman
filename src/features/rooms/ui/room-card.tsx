import { SpeakerIcon } from "lucide-react";

import { ListItem } from "@/components/list";
import type { RoomSummary } from "../client/room-types";
import { FollowRoomButton } from "./follow-room-button";
import { RoomLink } from "./room-link";

export function RoomCard({ roomSummary }: { roomSummary: RoomSummary }) {
  const hasRoomRole = !!roomSummary.viewerMembership;
  return (
    <ListItem>
      <div className="flex items-center justify-center size-8">
        <SpeakerIcon />
      </div>
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
        <FollowRoomButton room={roomSummary} />
      )}
    </ListItem>
  );
}
