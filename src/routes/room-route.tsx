import { useParams } from "react-router-dom";

import { RoomDetail } from "@/features/rooms/ui/room-detail";
import type { RoomId } from "@/features/rooms";

export function RoomRoute() {
  const { roomId = "" } = useParams();

  return <RoomDetail roomId={roomId as RoomId} />;
}
