import { FC } from "react";
import { Outlet } from "react-router-dom";

import { Main } from "@/components/main";
import { Sidebar } from "@/components/sidebar";
import { Chat } from "@/features/chat/chat";
import { useRoomPageState } from "@/features/rooms/runtime/use-room-page-state";
import { Room } from "@/features/rooms/ui/room";
import { RoomCreateForm } from "@/features/rooms/ui/room-create-form";
import { RoomHeader } from "@/features/rooms/ui/room-header";
import { Rooms } from "@/features/rooms/ui/rooms";
import { RoomsHeader } from "@/features/rooms/ui/rooms-header";
import { Player } from "@/features/spotify-player/player";

export const AuthedLayout: FC = () => (
  <div className="absolute gap-3 grid grid-cols-[auto_1fr_auto] inset-0 items-stretch p-3 overflow-x-auto scrollbar-none">
    <Sidebar style={{ "--section-color": "var(--color-emerald-400)" }}>
      <Outlet />
    </Sidebar>
    <RoomsLayout />
    <Player />
  </div>
);

function RoomsLayout() {
  const { roomId } = useRoomPageState();

  if (roomId) {
    return (
      <>
        <Main
          style={{
            "--section-color": "var(--palette-2, var(--color-red-400))",
          }}
        >
          <RoomHeader roomId={roomId} />
          <Room roomId={roomId} />
        </Main>
        <Chat roomId={roomId} />
      </>
    );
  }

  return (
    <>
      <Main
        style={{
          "--section-color": "var(--palette-2, var(--color-red-400))",
        }}
      >
        <RoomsHeader />
        <Rooms />
      </Main>
      <RoomCreateForm />
    </>
  );
}
