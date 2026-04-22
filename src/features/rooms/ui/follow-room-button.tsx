import { HeartIcon } from "lucide-react";
import { FC } from "react";

import { Button } from "@/components/ui/button";
import type { RoomSummary } from "../client/room-types";
import { useRooms } from "../runtime/rooms-provider";

export type FollowRoomButtonProps = { room: RoomSummary };

export const FollowRoomButton: FC<FollowRoomButtonProps> = ({ room }) => {
  const { followRoom, unfollowRoom } = useRooms();
  const isFollowed = room.viewerFollowsRoom;
  return (
    <Button
      variant="overlay"
      size="icon"
      onClick={() =>
        isFollowed
          ? void unfollowRoom(room.room._id)
          : void followRoom(room.room._id)
      }
    >
      <HeartIcon
        className={isFollowed ? "fill-current text-red-400" : undefined}
      />
    </Button>
  );
};
