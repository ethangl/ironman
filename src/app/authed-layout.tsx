import { Chat } from "@/features/chat/chat";
import { useRoomPageState } from "@/features/rooms/runtime/use-room-page-state";
import { RoomCreateForm } from "@/features/rooms/ui/room-create-form";
import { RoomsSurface } from "@/features/rooms/ui/rooms-surface";
import { Spotify } from "@/features/spotify-shell/spotify";

export function AuthedLayout() {
  const { roomId } = useRoomPageState();
  return (
    <div className="absolute gap-3 grid grid-cols-[auto_1fr_auto] inset-0 items-stretch p-3 overflow-x-auto scrollbar-none">
      <Spotify />
      <RoomsSurface />
      {roomId ? <Chat roomId={roomId} /> : <RoomCreateForm />}
    </div>
  );
}
