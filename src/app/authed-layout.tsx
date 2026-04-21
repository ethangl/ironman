import { BackgroundOverlay } from "@/components/background-overlay";
import { Chat } from "@/features/chat/chat";
import { useRoomPageState } from "@/features/rooms/runtime/use-room-page-state";
import { RoomCreateForm } from "@/features/rooms/ui/room-create-form";
import { RoomsNavbar } from "@/features/rooms/ui/rooms-navbar";
import { RoomsSurface } from "@/features/rooms/ui/rooms-surface";
import { Spotify } from "@/features/spotify-shell/spotify";

export function AuthedLayout() {
  const { roomId } = useRoomPageState();
  return (
    <div className="absolute gap-3 grid grid-cols-[auto_1fr_auto] inset-0 items-stretch p-3 overflow-x-auto scrollbar-none">
      <Spotify />
      <main className="flex flex-col gap-px max-h-full min-w-md overflow-hidden relative rounded-3xl text-red-300">
        <BackgroundOverlay className="dark:bg-red-400/50 backdrop-brightness-600 backdrop-contrast-600 mix-blend-exclusion" />
        <RoomsNavbar />
        <div className="flex-auto overflow-y-auto scrollbar-none space-y-px">
          <RoomsSurface />
        </div>
      </main>
      {roomId ? <Chat roomId={roomId} /> : <RoomCreateForm />}
    </div>
  );
}
