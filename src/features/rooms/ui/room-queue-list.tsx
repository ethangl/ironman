import { ArrowDownIcon, ArrowUpIcon, Trash2Icon } from "lucide-react";

import { List, ListItem } from "@/components/list";
import { Button } from "@/components/ui/button";
import { TrackCell } from "@/features/spotify-tracks/track-cell";
import type {
  RoomId,
  RoomQueueItem,
  RoomQueueItemId,
} from "../client/room-types";

export function RoomQueueList({
  canManageQueue,
  canRemoveQueueItem,
  currentQueueItemId,
  limit,
  onMove,
  onRemove,
  queue,
  roomId,
}: {
  canManageQueue: boolean;
  canRemoveQueueItem: (queueItem: RoomQueueItem) => boolean;
  currentQueueItemId: RoomQueueItemId | null;
  emptyLabel?: string;
  limit?: number;
  onMove?: (
    roomId: RoomId,
    queueItemId: RoomQueueItemId,
    targetIndex: number,
  ) => void;
  onRemove?: (roomId: RoomId, queueItemId: RoomQueueItemId) => void;
  queue: RoomQueueItem[];
  roomId: RoomId;
}) {
  const nextVisibleQueue = currentQueueItemId
    ? queue.filter((queueItem) => queueItem._id !== currentQueueItemId)
    : queue;
  const visibleQueue = limit
    ? nextVisibleQueue.slice(0, limit)
    : nextVisibleQueue;

  if (visibleQueue.length === 0) {
    return null;
  }

  return (
    <List count={visibleQueue.length}>
      {visibleQueue.map((queueItem, index) => {
        const canMoveUp = canManageQueue && index > 0;
        const canMoveDown = canManageQueue && index < visibleQueue.length - 1;
        const canRemove = canRemoveQueueItem(queueItem);

        return (
          <ListItem key={queueItem._id}>
            <TrackCell
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
                {canMoveUp && (
                  <Button
                    size="icon-sm"
                    onClick={() => onMove?.(roomId, queueItem._id, index - 1)}
                  >
                    <ArrowUpIcon />
                  </Button>
                )}
                {canMoveDown && (
                  <Button
                    size="icon-sm"
                    onClick={() => onMove?.(roomId, queueItem._id, index + 1)}
                  >
                    <ArrowDownIcon />
                  </Button>
                )}
                {canRemove && (
                  <Button
                    size="icon-sm"
                    onClick={() => onRemove?.(roomId, queueItem._id)}
                  >
                    <Trash2Icon />
                  </Button>
                )}
              </div>
            </TrackCell>
          </ListItem>
        );
      })}
    </List>
  );
}
