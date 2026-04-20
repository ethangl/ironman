import { useEffect, useMemo, useState } from "react";

import {
  Section,
  SectionContent,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { HeartCrackIcon, HeartIcon } from "lucide-react";
import { useRoomDetails } from "../client/room-hooks";
import type { RoomId } from "../client/room-types";
import { formatRoomSyncLabel } from "../client/room-utils";
import { resolveRoomPlayback } from "../runtime/room-sync";
import { useRooms } from "../runtime/rooms-provider";
import { RoomActivityFeed } from "./room-activity-feed";
import { RoomNowPlaying } from "./room-now-playing";
import { RoomQueue } from "./room-queue";
import { RoomStatusBadge } from "./room-status-badge";

export function RoomDetail({ roomId }: { roomId: RoomId }) {
  const { activeRoomId, syncState, joinRoom, leaveRoom } = useRooms();
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
  const isActiveRoom = activeRoomId === roomDetails.room._id;

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
              {roomDetails.viewerMembership ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => void leaveRoom(roomDetails.room._id)}
                >
                  <HeartIcon />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => void joinRoom(roomDetails.room._id)}
                >
                  <HeartCrackIcon />
                </Button>
              )}
            </div>
          </SectionTitle>
          {roomDetails.room.description && (
            <SectionDescription>
              {roomDetails.room.description}
            </SectionDescription>
          )}
        </SectionHeader>
        <SectionContent>
          <RoomNowPlaying
            resolvedPlayback={resolvedPlayback}
            room={roomDetails}
          />
        </SectionContent>
      </Section>
      <RoomQueue resolvedPlayback={resolvedPlayback} room={roomDetails} />
      <RoomActivityFeed roomDetails={roomDetails} />
    </>
  );
}
