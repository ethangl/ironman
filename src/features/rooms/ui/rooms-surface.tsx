import { useRoomPageState } from "../runtime/use-room-page-state";
import { RoomDetail } from "./room-detail";
import { RoomsHome } from "./rooms-home";

export function RoomsSurface() {
  const { roomId } = useRoomPageState();

  if (!roomId) {
    return <RoomsHome />;
  }

  return <RoomDetail roomId={roomId} />;
}
