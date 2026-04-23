import { ArrowDownIcon, ArrowUpIcon, Trash2Icon } from "lucide-react";

import { useAuthenticatedSession } from "@/app/require-authenticated-session";
import { List } from "@/components/list";
import { Button } from "@/components/ui/button";
import { TrackCell } from "@/features/spotify-tracks/track-cell";
import type { RoomDetails } from "../client/room-types";
import {
  getVisibleRoomQueue,
  ResolvedRoomPlayback,
} from "../runtime/room-sync";
import { useRooms } from "../runtime/rooms-provider";

export function RoomQueue({
  limit,
  room,
  resolvedPlayback,
}: {
  limit?: number;
  room: RoomDetails;
  resolvedPlayback: ResolvedRoomPlayback | null;
}) {
  const session = useAuthenticatedSession();
  const { moveQueueItem, removeQueueItem } = useRooms();

  const canManageOwnQueueItems = !!room.viewerMembership;
  const currentQueueItemId = resolvedPlayback?.currentQueueItemId ?? null;
  const roomQueue = getVisibleRoomQueue(room, resolvedPlayback);

  const visibleQueue = (
    currentQueueItemId
      ? roomQueue.filter((queueItem) => queueItem._id !== currentQueueItemId)
      : roomQueue
  ).slice(0, limit);

  if (visibleQueue.length === 0) {
    return null;
  }

  return (
    <List count={visibleQueue.length}>
      {visibleQueue.map((queueItem, index) => {
        const canMoveUp = room.playback.canManageQueue && index > 0;
        const canMoveDown =
          room.playback.canManageQueue && index < visibleQueue.length - 1;
        const canRemove =
          canManageOwnQueueItems &&
          (room.playback.canManageQueue ||
            queueItem.addedByUserId === session.user.id);

        return (
          <TrackCell
            key={queueItem._id}
            count={index + 1}
            track={{
              id: queueItem.trackId,
              name: queueItem.trackName,
              artist: queueItem.trackArtists.join(","),
              albumImage: queueItem.trackImageUrl,
              durationMs: queueItem.trackDurationMs,
            }}
          >
            <div className="flex items-center gap-1">
              {canMoveUp ? (
                <Button
                  size="icon-sm"
                  onClick={() =>
                    void moveQueueItem(room.room._id, queueItem._id, index - 1)
                  }
                >
                  <ArrowUpIcon />
                </Button>
              ) : null}
              {canMoveDown ? (
                <Button
                  size="icon-sm"
                  onClick={() =>
                    void moveQueueItem(room.room._id, queueItem._id, index + 1)
                  }
                >
                  <ArrowDownIcon />
                </Button>
              ) : null}
              {canRemove ? (
                <Button
                  size="icon-sm"
                  onClick={() =>
                    void removeQueueItem(room.room._id, queueItem._id)
                  }
                >
                  <Trash2Icon />
                </Button>
              ) : null}
            </div>
          </TrackCell>
        );
      })}
    </List>
  );
}
