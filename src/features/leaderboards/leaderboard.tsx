import { AppLink } from "@/components/app-link";
import { Avatar } from "@/components/avatar";
import { List, ListItem } from "@/components/list";
import type { LeaderboardEntry } from "@shared/leaderboards";
import { useLeaderboardData } from "./use-leaderboard-data";

function EntryRow({
  entry,
  showTrack,
  liveCount,
}: {
  entry: LeaderboardEntry;
  showTrack: boolean;
  liveCount?: number;
}) {
  const count =
    entry.isMe && liveCount !== undefined
      ? Math.max(liveCount, entry.count)
      : entry.count;
  const isNewRecord =
    entry.isMe && liveCount !== undefined && liveCount > entry.count;

  return (
    <ListItem
      className={
        entry.isMe
          ? "bg-red-500/10 border border-red-500/20"
          : entry.rank === 1
            ? "bg-linear-to-r from-yellow-500/10 to-transparent border border-yellow-500/20"
            : undefined
      }
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-sm ${
          entry.rank === 1
            ? "bg-yellow-500 text-mist-950"
            : entry.rank === 2
              ? "bg-mist-300 text-mist-950"
              : entry.rank === 3
                ? "bg-amber-700 text-foreground"
                : "bg-white/10 text-muted-foreground"
        }`}
      >
        {entry.rank}
      </div>

      <Avatar
        id={entry.userId}
        image={entry.userImage}
        name={entry.userName}
        sizeClassName="size-8 text-3xl"
      />

      <div className="flex-1 min-w-0 truncate">
        <div className="flex items-center gap-2">
          {entry.userId && !entry.isMe ? (
            <AppLink
              href={`/profile/${entry.userId}`}
              className="truncate font-medium text-sm hover:text-red-400 transition"
            >
              {entry.userName ?? "Anonymous"}
            </AppLink>
          ) : (
            <span className="truncate font-medium text-sm">
              {entry.isMe ? "You" : (entry.userName ?? "Anonymous")}
            </span>
          )}
        </div>
        {entry.weaknessCount != null && entry.weaknessCount > 0 && (
          <span className="text-[10px] text-muted-foreground">
            {entry.weaknessCount}{" "}
            {entry.weaknessCount === 1 ? "weakness" : "weaknesses"}
          </span>
        )}
        {showTrack && entry.trackId && (
          <AppLink
            href={`/song/${entry.trackId}`}
            className="truncate text-xs text-muted-foreground hover:text-foreground transition"
          >
            {entry.trackName} - {entry.trackArtist}
          </AppLink>
        )}
        {showTrack && !entry.trackId && (
          <p className="truncate text-xs text-muted-foreground">
            {entry.trackName} - {entry.trackArtist}
          </p>
        )}
      </div>

      <div className="text-right shrink-0">
        <span className="text-xl font-bold tabular-nums">{count}</span>
        <span className="ml-1 text-xs text-muted-foreground">plays</span>
        {isNewRecord && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 animate-pulse">
            New PB
          </p>
        )}
      </div>
    </ListItem>
  );
}

export function Leaderboard({
  trackId,
  liveCount,
  title = "Longest Streaks",
}: {
  trackId?: string;
  liveCount?: number;
  title?: string;
}) {
  const { entries, myEntry, loading } = useLeaderboardData(trackId);

  return (
    <LeaderboardList
      entries={entries}
      myEntry={myEntry}
      loading={loading}
      trackId={trackId}
      liveCount={liveCount}
      title={title}
    />
  );
}

export function LeaderboardList({
  entries,
  myEntry,
  loading,
  trackId,
  liveCount,
  title = "Longest Streaks",
}: {
  entries: LeaderboardEntry[];
  myEntry: LeaderboardEntry | null;
  loading: boolean;
  trackId?: string;
  liveCount?: number;
  title?: string;
}) {
  return (
    <List title={title} loading={loading} count={liveCount}>
      {entries.map((entry) => (
        <EntryRow
          key={entry.id}
          entry={entry}
          showTrack={!trackId}
          liveCount={entry.isMe ? liveCount : undefined}
        />
      ))}
      {myEntry && (
        <>
          <div className="flex items-center gap-2 py-1 text-muted-foreground">
            <div className="flex-1 border-t" />
            <span className="text-xs">...</span>
            <div className="flex-1 border-t" />
          </div>
          <EntryRow
            entry={myEntry}
            showTrack={!trackId}
            liveCount={liveCount}
          />
        </>
      )}
    </List>
  );
}
