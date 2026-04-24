import { FC } from "react";
import { Outlet } from "react-router-dom";

import { Main } from "@/components/main";
import { Sidebar, SidebarWrapper } from "@/components/sidebar";
import { Chat } from "@/features/chat/chat";
import { useRoomPageState } from "@/features/rooms/runtime/use-room-page-state";
import { Room } from "@/features/rooms/ui/room";
import { RoomCreateForm } from "@/features/rooms/ui/room-create-form";
import { RoomHeader } from "@/features/rooms/ui/room-header";
import { Rooms } from "@/features/rooms/ui/rooms";
import { RoomsHeader } from "@/features/rooms/ui/rooms-header";
import { MiniPlayer } from "@/features/spotify-player/mini-player2";
import { Player } from "@/features/spotify-player/player";
import { PlayerWrapper } from "@/features/spotify-player/player-wrapper2";
import { useNowPlaying } from "@/features/spotify-player/use-now-playing";

export const AuthedLayout: FC = () => {
  const { isPlaying } = useNowPlaying();
  return (
    <div className="absolute gap-3 grid grid-cols-[auto_1fr_auto] inset-0 items-stretch p-3 overflow-x-auto scrollbar-none">
      <Sidebar
        className={
          isPlaying
            ? "duration-888 ease-elastic gap-3"
            : "duration-333 ease-out gap-0"
        }
      >
        <SidebarWrapper
          style={{ "--section-color": "var(--color-emerald-400)" }}
        >
          <Outlet />
        </SidebarWrapper>
        <PlayerWrapper>
          <MiniPlayer />
        </PlayerWrapper>
      </Sidebar>
      <RoomsLayout />
      <Player />
    </div>
  );
};

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
