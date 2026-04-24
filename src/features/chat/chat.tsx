import { MessageSquareIcon, PanelRightCloseIcon } from "lucide-react";

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
import { UserMenu } from "./user-menu";

export function Chat({ roomId }: { roomId: RoomId }) {
  const roomQuery = useRoomDetails(roomId);

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
          <div className="p-4">not yet, chatty cathy</div>
        </SidebarContent>
      </SidebarWrapper>
      <SidebarWrapper
        className="flex-none h-16"
        style={{
          "--section-color": "var(--palette-2, var(--color-red-400))",
        }}
      >
        <SidebarFooter>
          <UserMenu />
        </SidebarFooter>
      </SidebarWrapper>
    </Sidebar>
  );
}
