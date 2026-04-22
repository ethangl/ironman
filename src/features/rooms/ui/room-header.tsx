import { ArrowLeftIcon } from "lucide-react";

import { FC } from "react";

import { MainHeader } from "@/components/main";
import { Button } from "@/components/ui/button";
import { RoomId, useRoomDetails } from "@/features/rooms";
import { RoomHeaderMenu } from "./room-header-menu";
import { RoomLink } from "./room-link";

export const RoomHeader: FC<{ roomId: RoomId }> = ({ roomId }) => {
  const { data } = useRoomDetails(roomId);

  if (!data) {
    return null;
  }

  const { room } = data;

  return (
    <MainHeader title={room.name}>
      <Button
        variant="ghost"
        size="icon-sm"
        nativeButton={false}
        render={
          <RoomLink roomId={null}>
            <ArrowLeftIcon />
          </RoomLink>
        }
      />
      <RoomHeaderMenu roomDetails={data} />
    </MainHeader>
  );
};
