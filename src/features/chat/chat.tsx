import { MessageSquareIcon, PanelRightCloseIcon } from "lucide-react";

import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarToggle,
} from "@/components/sidebar";
import { useRoomDetails } from "../rooms/client/room-hooks";
import type { RoomId } from "../rooms/client/room-types";
import { RoomPeople } from "../rooms/ui/room-people";

export function Chat({ roomId }: { roomId: RoomId }) {
  const roomQuery = useRoomDetails(roomId);

  if (!roomQuery.data) {
    return null;
  }

  const room = roomQuery.data;

  return (
    <Sidebar style={{ "--section-color": "var(--color-cyan-400)" }}>
      <SidebarHeader>
        <SidebarToggle
          collapseIcon={<PanelRightCloseIcon />}
          expandIcon={<MessageSquareIcon />}
        />
      </SidebarHeader>
      <SidebarContent>
        <Section>
          <SectionHeader>
            <SectionTitle>
              Chat
              <RoomPeople people={room.presentUsers} />
            </SectionTitle>
          </SectionHeader>
          <SectionContent>not yet</SectionContent>
        </Section>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
