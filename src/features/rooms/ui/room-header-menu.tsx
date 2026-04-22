import { Trash2Icon } from "lucide-react";
import { FC } from "react";

import { MoreMenu } from "@/components/more-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useRooms } from "@/features/rooms";
import { RoomDetails } from "../client/room-types";
import { FollowRoomButton } from "./follow-room-button";

export const RoomHeaderMenu: FC<{ roomDetails: RoomDetails }> = ({
  roomDetails,
}) => {
  const { clearQueue } = useRooms();

  const {
    room,
    playback: { canControlPlayback },
    viewerMembership,
  } = roomDetails;

  return (
    <nav className="flex items-center">
      {!viewerMembership && <FollowRoomButton room={roomDetails} />}
      {canControlPlayback && (
        <MoreMenu>
          <DropdownMenuItem onClick={() => void clearQueue(room._id)}>
            <Trash2Icon /> Clear Queue
          </DropdownMenuItem>
        </MoreMenu>
      )}
    </nav>
  );
};
