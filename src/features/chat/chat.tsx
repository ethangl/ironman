import { api } from "@api";
import { useMutation } from "convex/react";
import { MessageSquareIcon, PanelRightCloseIcon } from "lucide-react";
import { useEffect, useRef } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarToggle,
  SidebarWrapper,
} from "@/components/sidebar";
import { useRoomDetails } from "../rooms/client/room-hooks";
import type { RoomId } from "../rooms/client/room-types";
import type { ResolvedRoomPlayback } from "../rooms/runtime/room-sync";
import { ChatForm } from "./chat-form";
import { RoomActivity } from "./room-activity";
import { UserMenu } from "./user-menu";

function useRoomActivityJoinedAt(roomId: RoomId) {
  const joinedAtRef = useRef(Date.now());
  const roomIdRef = useRef(roomId);

  if (roomIdRef.current !== roomId) {
    roomIdRef.current = roomId;
    joinedAtRef.current = Date.now();
  }

  return joinedAtRef.current;
}

function useRoomActivityRecorder({
  joinedAt,
  resolvedPlayback,
  roomId,
}: {
  joinedAt: number;
  resolvedPlayback: ResolvedRoomPlayback | null;
  roomId: RoomId;
}) {
  const recordCurrentTrackStarted = useMutation(
    api.rooms.recordCurrentTrackStarted,
  );
  const recordedQueueItemsRef = useRef(new Set<string>());
  const currentQueueItemId = resolvedPlayback?.currentQueueItemId ?? null;
  const startedAt = resolvedPlayback?.startedAt ?? null;

  useEffect(() => {
    recordedQueueItemsRef.current.clear();
  }, [joinedAt, roomId]);

  useEffect(() => {
    if (!currentQueueItemId || startedAt === null || startedAt < joinedAt) {
      return;
    }

    const key = `${roomId}:${currentQueueItemId}`;
    if (recordedQueueItemsRef.current.has(key)) {
      return;
    }

    recordedQueueItemsRef.current.add(key);
    void recordCurrentTrackStarted({
      roomId,
      queueItemId: currentQueueItemId,
    }).catch(() => {
      recordedQueueItemsRef.current.delete(key);
    });
  }, [
    currentQueueItemId,
    joinedAt,
    recordCurrentTrackStarted,
    roomId,
    startedAt,
  ]);
}

export function Chat({ roomId }: { roomId: RoomId }) {
  const joinedAt = useRoomActivityJoinedAt(roomId);
  const roomQuery = useRoomDetails(roomId);
  useRoomActivityRecorder({
    joinedAt,
    resolvedPlayback: roomQuery.resolvedPlayback,
    roomId,
  });

  if (!roomQuery.data) {
    return null;
  }

  return (
    <Sidebar>
      <SidebarWrapper>
        <SidebarHeader title="Chat">
          <SidebarToggle
            collapseIcon={<PanelRightCloseIcon />}
            expandIcon={<MessageSquareIcon />}
          />
        </SidebarHeader>
        <SidebarContent>
          <RoomActivity joinedAt={joinedAt} roomId={roomId} />
        </SidebarContent>
      </SidebarWrapper>
      <SidebarWrapper className="flex-none h-16">
        <SidebarFooter>
          <UserMenu />
          <ChatForm roomId={roomId} />
        </SidebarFooter>
      </SidebarWrapper>
    </Sidebar>
  );
}
