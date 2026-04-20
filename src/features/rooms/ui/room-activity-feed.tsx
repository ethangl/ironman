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
      <SectionContent>
        <ol className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="rounded-3xl bg-white/5 px-4 py-3 text-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{entry.title}</p>
                <span className="text-xs text-muted-foreground">
                  {formatRoomTimestamp(entry.at)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {entry.detail}
              </p>
            </li>
          ))}
        </ol>
      </SectionContent>
    </Section>
  );
}
