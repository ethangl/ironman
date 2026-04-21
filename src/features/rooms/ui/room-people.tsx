import { Avatar } from "@/components/avatar";
import type { RoomUserSnapshot } from "../client/room-types";

export function RoomPeople({ people }: { people: RoomUserSnapshot[] }) {
  if (people.length === 0) {
    return null;
  }

  return (
    <div className="flex -gap-2 items-center">
      {people.map((user) => (
        <Avatar
          key={user.userId}
          id={user.userId}
          image={user.image}
          name={user.name}
          sizeClassName="size-8 text-xl"
        />
      ))}
    </div>
  );
}
