import { ArrowDownIcon, ArrowUpIcon, Trash2Icon } from "lucide-react";

import { AlbumArt } from "@/components/album-art";
import { BackgroundOverlay } from "@/components/background-overlay";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RoomId, RoomQueueItem, RoomQueueItemId } from "../client/room-types";

export function RoomQueueList({
  canManageQueue,
  canRemoveQueueItem,
  compact = false,
  currentQueueItemId,
  emptyLabel = "Use the search bar to add the first track.",
  limit,
  onMove,
  onRemove,
  queue,
  roomId,
}: {
  canManageQueue: boolean;
  canRemoveQueueItem: (queueItem: RoomQueueItem) => boolean;
  compact?: boolean;
  currentQueueItemId: RoomQueueItemId | null;
  emptyLabel?: string;
  limit?: number;
  onMove?: (roomId: RoomId, queueItemId: RoomQueueItemId, targetIndex: number) => void;
  onRemove?: (roomId: RoomId, queueItemId: RoomQueueItemId) => void;
  queue: RoomQueueItem[];
  roomId: RoomId;
}) {
  const visibleQueue = limit ? queue.slice(0, limit) : queue;

  if (visibleQueue.length === 0) {
    return (
      <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <ol className="space-y-2">
      {visibleQueue.map((queueItem, index) => {
        const isCurrentQueueItem = currentQueueItemId === queueItem._id;
        const canMoveUp = canManageQueue && !isCurrentQueueItem && index > 0;
        const canMoveDown =
          canManageQueue &&
          !isCurrentQueueItem &&
          index < visibleQueue.length - 1;
        const canRemove = canRemoveQueueItem(queueItem);

        return (
          <li
            key={queueItem._id}
            className={cn(
              "group relative flex items-center gap-3 overflow-hidden rounded-3xl px-3 py-2.5",
              compact ? "min-h-14" : "min-h-16",
            )}
          >
            <BackgroundOverlay className="rounded-3xl" />
            <div className="relative z-10 flex flex-auto items-center gap-3 min-w-0">
              <div className="flex items-center justify-center text-[11px] font-semibold tabular-nums text-muted-foreground w-5">
                {isCurrentQueueItem ? "Now" : index + 1}
              </div>
              <AlbumArt
                src={queueItem.trackImageUrl}
                className={compact ? "size-10" : "size-12"}
              />
              <div className="min-w-0 space-y-0.5">
                <p className="truncate text-sm font-medium">
                  {queueItem.trackName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {queueItem.trackArtists.join(", ")}
                </p>
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-1">
              {canMoveUp ? (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onMove?.(roomId, queueItem._id, queueItem.position - 1)}
                >
                  <ArrowUpIcon />
                </Button>
              ) : null}
              {canMoveDown ? (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onMove?.(roomId, queueItem._id, queueItem.position + 1)}
                >
                  <ArrowDownIcon />
                </Button>
              ) : null}
              {canRemove ? (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onRemove?.(roomId, queueItem._id)}
                >
                  <Trash2Icon />
                </Button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
