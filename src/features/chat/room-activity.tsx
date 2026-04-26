import { api } from "@api";

import { SidebarContent } from "@/components/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useStableQuery } from "@/hooks/use-stable-query";
import type { RoomActivityEvent, RoomId } from "../rooms/client/room-types";
import { RoomActivityItem } from "./room-activity-item";

export function RoomActivity({
  joinedAt,
  roomId,
}: {
  joinedAt: number;
  roomId: RoomId;
}) {
  const events = useStableQuery(api.rooms.listActivity, {
    roomId,
    since: joinedAt,
    limit: 100,
  }) as RoomActivityEvent[] | undefined;
  const activityScrollKey = events?.map((event) => event._id).join(":");

  return (
    <SidebarContent scrollToBottomKey={activityScrollKey}>
      <ol className="flex gap-2 min-h-full flex-col justify-end">
        {events === undefined ? (
          <li className="flex items-center justify-center p-6">
            <Spinner />
          </li>
        ) : (
          events.map((event) => (
            <RoomActivityItem key={event._id} event={event} />
          ))
        )}
      </ol>
    </SidebarContent>
  );
}
