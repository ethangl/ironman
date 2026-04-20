import { useParams } from "react-router-dom";

import { Spinner } from "@/components/ui/spinner";
import { useRoomDetails, type RoomId } from "@/features/rooms";
import { RoomActivityFeed } from "@/features/rooms/ui/room-activity-feed";
import { RoomQueue } from "@/features/rooms/ui/room-queue";

export function RoomRoute() {
  const { roomId } = useParams<{ roomId: RoomId }>();
  const roomQuery = useRoomDetails(roomId);

  if (roomQuery.loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (roomQuery.notFound || !roomQuery.data) {
    return (
      <div className="py-32 text-center text-muted-foreground">
        That room could not be found.
      </div>
    );
  }

  return (
    <>
      <RoomQueue
        resolvedPlayback={roomQuery.resolvedPlayback}
        room={roomQuery.data}
      />
      <RoomActivityFeed room={roomQuery.data} />
    </>
  );
}
