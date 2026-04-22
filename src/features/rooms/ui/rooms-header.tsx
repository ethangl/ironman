import { HomeIcon } from "lucide-react";
import { FC } from "react";

import { MainHeader } from "@/components/main";
import { Button } from "@/components/ui/button";
import { RoomLink } from "./room-link";

export const RoomsHeader: FC = () => (
  <MainHeader title="Rooms">
    <Button
      variant="ghost"
      size="icon-sm"
      nativeButton={false}
      render={
        <RoomLink roomId={null}>
          <HomeIcon />
        </RoomLink>
      }
    />
    <span />
  </MainHeader>
);
