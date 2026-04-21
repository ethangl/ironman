import { cn } from "@/lib/utils";
import type { RoomSyncState } from "../client/room-types";

const toneClassNames: Record<RoomSyncState["code"], string> = {
  idle: "bg-white/10 text-muted-foreground",
  queue_empty: "bg-white/10 text-muted-foreground",
  paused: "bg-amber-400/15 text-amber-200",
  syncing: "bg-sky-400/15 text-sky-200",
  synced: "bg-emerald-400/15 text-emerald-200",
};

export function RoomStatusBadge({
  className,
  label,
  syncState,
}: {
  className?: string;
  label: string;
  syncState: RoomSyncState;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium tracking-[0.02em]",
        toneClassNames[syncState.code],
        className,
      )}
    >
      {label}
    </span>
  );
}
