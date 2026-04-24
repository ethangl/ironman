import { MainContent } from "@/components/main";
import { Section, SectionFooter } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useRoomDetails, type RoomId } from "@/features/rooms";
import { useSearch } from "@/features/spotify-search/search-provider";
import { RoomQueue } from "./room-queue";

export function Room({ roomId }: { roomId: RoomId }) {
  const roomQuery = useRoomDetails(roomId);
  const { setOpen } = useSearch();

  if (roomQuery.loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (roomQuery.notFound || !roomQuery.data) {
    return (
      <div className="py-32 text-center text-muted-foreground">
        That room could not be found.
      </div>
    );
  }

  const { data, resolvedPlayback } = roomQuery;

  return (
    <MainContent>
      <Section>
        <RoomQueue resolvedPlayback={resolvedPlayback} room={data} />
        <SectionFooter>
          <Button onClick={() => setOpen(true)}>Add to Queue</Button>
        </SectionFooter>
      </Section>
    </MainContent>
  );
}
