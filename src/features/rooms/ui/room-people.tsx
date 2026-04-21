import type { ReactNode } from "react";

import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { Avatar } from "@/components/avatar";
import { cn } from "@/lib/utils";
import type { RoomDetails } from "../client/room-types";

function PersonRow({
  image,
  name,
  id,
  meta,
}: {
  image: string | null;
  name: string;
  id: string;
  meta?: ReactNode;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-3xl bg-white/5 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar
          id={id}
          image={image}
          name={name}
          sizeClassName="size-10 text-xl"
        />
        <p className="truncate text-sm font-medium">{name}</p>
      </div>
      {meta}
    </li>
  );
}

export function RoomPeople({ room }: { room: RoomDetails }) {
  const presentUserIds = new Set(room.presentUsers.map((user) => user.userId));

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>People</SectionTitle>
      </SectionHeader>
      <SectionContent className="grid gap-4 xl:grid-cols-2">
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium">In Room Now</h3>
            <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-medium text-emerald-200">
              {room.presentCount}
            </span>
          </div>
          {room.presentUsers.length > 0 ? (
            <ul className="space-y-2">
              {room.presentUsers.map((presentUser) => (
                <PersonRow
                  key={`present:${presentUser.userId}`}
                  id={presentUser.userId}
                  image={presentUser.image}
                  name={presentUser.name}
                />
              ))}
            </ul>
          ) : (
            <p className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-muted-foreground">
              No one is listening here right now.
            </p>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium">Room Roles</h3>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              {room.memberCount}
            </span>
          </div>
          {room.roleHolders.length > 0 ? (
            <ul className="space-y-2">
              {room.roleHolders.map((roleHolder) => (
                <PersonRow
                  key={`role:${roleHolder.userId}`}
                  id={roleHolder.userId}
                  image={roleHolder.image}
                  name={roleHolder.name}
                  meta={
                    <div className="flex items-center gap-2">
                      {presentUserIds.has(roleHolder.userId) ? (
                        <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-medium text-emerald-200">
                          Here now
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-medium",
                          roleHolder.role === "owner"
                            ? "bg-amber-300/15 text-amber-100"
                            : roleHolder.role === "moderator"
                              ? "bg-sky-300/15 text-sky-100"
                              : "bg-white/10 text-muted-foreground",
                        )}
                      >
                        {roleHolder.role}
                      </span>
                    </div>
                  }
                />
              ))}
            </ul>
          ) : (
            <p className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-muted-foreground">
              This room does not have any role holders yet.
            </p>
          )}
        </section>
      </SectionContent>
    </Section>
  );
}
