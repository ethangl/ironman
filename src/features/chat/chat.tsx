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
  SidebarWrapper,
} from "@/components/sidebar";
import { useRoomDetails } from "../rooms/client/room-hooks";
import type { RoomId } from "../rooms/client/room-types";
import { RoomPeople } from "../rooms/ui/room-people";
import { UserMenu } from "./user-menu";

export function Chat({ roomId }: { roomId: RoomId }) {
  const roomQuery = useRoomDetails(roomId);

  if (!roomQuery.data) {
    return null;
  }

  const room = roomQuery.data;

  return (
    <Sidebar>
      <SidebarWrapper
        style={{
          "--section-color": "var(--palette-2, var(--color-red-400))",
        }}
      >
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
            <SectionContent>not yet, chatty cathy</SectionContent>
          </Section>
        </SidebarContent>
        <SidebarFooter>
          <UserMenu />
        </SidebarFooter>
      </SidebarWrapper>
    </Sidebar>
  );
}
