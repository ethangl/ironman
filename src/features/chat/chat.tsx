import { MessageSquareIcon, PanelRightCloseIcon } from "lucide-react";
import { useRef } from "react";

import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarToggle,
  SidebarWrapper,
} from "@/components/sidebar";
import { useRoomDetails } from "../rooms/client/room-hooks";
import type { RoomId } from "../rooms/client/room-types";
import { ChatForm } from "./chat-form";
import { RoomActivity } from "./room-activity";
import { useRoomActivityRecorder } from "./use-room-activity-recorder";
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

export function Chat({ roomId }: { roomId: RoomId }) {
  const joinedAt = useRoomActivityJoinedAt(roomId);
  const { resolvedPlayback } = useRoomDetails(roomId);

  useRoomActivityRecorder({
    joinedAt,
    resolvedPlayback,
    roomId,
  });

  return (
    <Sidebar>
      <SidebarWrapper>
        <SidebarHeader title="Chat">
          <SidebarToggle
            collapseIcon={<PanelRightCloseIcon />}
            expandIcon={<MessageSquareIcon />}
          />
        </SidebarHeader>
        <RoomActivity joinedAt={joinedAt} roomId={roomId} />
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
