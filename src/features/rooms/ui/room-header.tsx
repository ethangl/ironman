import { ShipIcon } from "lucide-react";

import { FC } from "react";

import { MainHeader } from "@/components/main";
import { Square } from "@/components/square";
import { RoomId, useRoomDetails } from "@/features/rooms";
import { RoomHeaderMenu } from "./room-header-menu";

export const RoomHeader: FC<{ roomId: RoomId }> = ({ roomId }) => {
  const { data } = useRoomDetails(roomId);

  if (!data) {
    return null;
  }

  const { room } = data;

  return (
    <MainHeader title={room.name}>
      {/* <Button
        variant="ghost"
        size="icon-sm"
        nativeButton={false}
        render={
          <RoomLink roomId={null}>
            <ArrowLeftIcon />
          </RoomLink>
        }
      /> */}
      <Square className="size-8">
        <ShipIcon className="size-5" />
      </Square>
      <RoomHeaderMenu roomDetails={data} />
    </MainHeader>
  );
};
