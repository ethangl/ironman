import { api } from "@api";
import { useQuery } from "convex/react";

import { Spinner } from "@/components/ui/spinner";
import type { RoomActivityEvent, RoomId } from "../rooms/client/room-types";
import { RoomActivityItem } from "./room-activity-item";

export function RoomActivity({
  joinedAt,
  roomId,
}: {
  joinedAt: number;
  roomId: RoomId;
}) {
  const events = useQuery(api.rooms.listActivity, {
    roomId,
    since: joinedAt,
    limit: 100,
  }) as RoomActivityEvent[] | undefined;

  return (
    <div className="flex min-h-full flex-col">
      {events === undefined ? (
        <div className="flex items-center justify-center p-6">
          <Spinner />
        </div>
      ) : events.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">No new activity</div>
      ) : (
        <ol className="space-y-2 p-3">
          {events.map((event) => (
            <RoomActivityItem event={event} key={event._id} />
          ))}
        </ol>
      )}
    </div>
  );
}
