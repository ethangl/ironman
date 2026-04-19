import { PauseIcon, PlayIcon, SkipForwardIcon, Trash2Icon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Section,
  SectionContent,
  SectionDescription,
  SectionFooter,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useRoomDetails } from "../client/room-hooks";
import type { RoomId } from "../client/room-types";
import {
  formatRoomDuration,
  formatRoomSyncLabel,
  toRoomTrack,
} from "../client/room-utils";
import { resolveRoomPlayback } from "../runtime/room-sync";
import { useRooms } from "../runtime/rooms-provider";
import { RoomActivityFeed } from "./room-activity-feed";
import { RoomQueue } from "./room-queue";
import { RoomStatusBadge } from "./room-status-badge";

export function RoomDetail({ roomId }: { roomId: RoomId }) {
  const {
    activeRoomId,
    clearQueue,
    joinRoom,
    leaveRoom,
    pauseRoom,
    playRoom,
    repairSync,
    resumeRoom,
    selectActiveRoom,
    skipRoom,
    syncState,
  } = useRooms();
  const roomQuery = useRoomDetails(roomId);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!roomQuery.data || roomQuery.data.playback.paused) {
      setNow(Date.now());
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [roomQuery.data]);

  const resolvedPlayback = useMemo(
    () => resolveRoomPlayback(roomQuery.data, now),
    [now, roomQuery.data],
  );

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

  const roomDetails = roomQuery.data;
  const currentQueueItem = resolvedPlayback?.currentQueueItem ?? null;
  const currentTrack = toRoomTrack(currentQueueItem);
  const isActiveRoom = activeRoomId === roomDetails.room._id;
  const canControlPlayback = roomDetails.playback.canControlPlayback;
  const roomActionLabel = !currentQueueItem
    ? "Start room"
    : resolvedPlayback?.paused
      ? "Resume room"
      : "Pause room";

  return (
    <>
      <Section>
        <SectionHeader>
          <SectionTitle>
            {roomDetails.room.name}
            <div className="flex flex-wrap items-center gap-2">
              <RoomStatusBadge
                syncState={
                  isActiveRoom
                    ? syncState
                    : { code: "idle", label: "Browse only", driftMs: null }
                }
                label={
                  isActiveRoom
                    ? formatRoomSyncLabel(syncState)
                    : roomDetails.viewerMembership
                      ? "Joined"
                      : "Public room"
                }
              />
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {roomDetails.memberCount} listening
              </span>
            </div>
          </SectionTitle>
          {roomDetails.room.description && (
            <SectionDescription>
              {roomDetails.room.description}
            </SectionDescription>
          )}
        </SectionHeader>
        <SectionContent>
          <div className="rounded-[2rem] bg-white/5 p-4">
            <div className="mt-3 space-y-1">
              <h2 className="text-2xl font-semibold">
                {currentTrack?.name ?? "Queue is ready for its next track"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentTrack
                  ? `${roomDetails.room.name} • ${currentTrack.artist} • ${formatRoomDuration(
                      resolvedPlayback?.currentOffsetMs ?? 0,
                    )}`
                  : "Use the search bar above to start filling this room."}
              </p>
            </div>
            {canControlPlayback ? (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  onClick={() =>
                    currentQueueItem
                      ? resolvedPlayback?.paused
                        ? void resumeRoom(roomDetails.room._id)
                        : void pauseRoom(roomDetails.room._id)
                      : void playRoom(roomDetails.room._id)
                  }
                >
                  {!currentQueueItem || resolvedPlayback?.paused ? (
                    <PlayIcon />
                  ) : (
                    <PauseIcon />
                  )}
                  {roomActionLabel}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => void skipRoom(roomDetails.room._id)}
                >
                  <SkipForwardIcon />
                  Skip
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => void clearQueue(roomDetails.room._id)}
                >
                  <Trash2Icon />
                  Clear queue
                </Button>
              </div>
            ) : roomDetails.viewerMembership ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Search from the navbar to queue tracks into this room. Playback
                controls stay with the room owner or a moderator.
              </p>
            ) : null}
          </div>
        </SectionContent>
        <SectionFooter>
          {!roomDetails.viewerMembership ? (
            <Button onClick={() => void joinRoom(roomDetails.room._id)}>
              Join room
            </Button>
          ) : !isActiveRoom ? (
            <Button onClick={() => selectActiveRoom(roomDetails.room._id)}>
              Listen here
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={repairSync}>
                Sync to room
              </Button>
              <Button
                variant="ghost"
                onClick={() => void leaveRoom(roomDetails.room._id)}
              >
                Leave room
              </Button>
            </>
          )}
        </SectionFooter>
      </Section>
      <RoomQueue resolvedPlayback={resolvedPlayback} room={roomDetails} />
      <RoomActivityFeed roomDetails={roomDetails} />
    </>
  );
}
