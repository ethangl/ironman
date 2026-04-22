import { Main, MainContent, MainHeader } from "@/components/main";
import { useRoomPageState } from "../runtime/use-room-page-state";
import { RoomDetail } from "./room-detail";
import { RoomsHome } from "./rooms-home";
import { RoomsNavbar } from "./rooms-navbar";

export function RoomsSurface() {
  const { roomId } = useRoomPageState();

  return (
    <Main style={{ "--section-color": "var(--color-red-400)" }}>
      <MainHeader>
        <RoomsNavbar />
      </MainHeader>
      <MainContent>
        {roomId ? <RoomDetail roomId={roomId} /> : <RoomsHome />}
      </MainContent>
    </Main>
  );
}
