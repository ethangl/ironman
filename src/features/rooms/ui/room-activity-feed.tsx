import { List, ListItem } from "@/components/list";
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import type { RoomDetails } from "../client/room-types";
import {
  buildRoomActivityEntries,
  formatRoomTimestamp,
} from "../client/room-utils";

export function RoomActivityFeed({ room }: { room: RoomDetails }) {
  const entries = buildRoomActivityEntries(room);

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Room Activity</SectionTitle>
      </SectionHeader>
      <SectionContent className="px-3 pb-3">
        <List count={entries.length}>
          {entries.map((entry) => (
            <ListItem key={entry.id}>
              <p className="col-span-2 font-medium text-xs">
                <span className="text-muted-foreground">{entry.title} </span>
                <span>{entry.detail}</span>
              </p>
              <div className="text-right text-muted-foreground text-xs w-14">
                {formatRoomTimestamp(entry.at)}
              </div>
            </ListItem>
          ))}
        </List>
      </SectionContent>
    </Section>
  );
}
