import { List, ListLink } from "@/components/list";
import { getCurrentMilestone } from "@/lib/milestones";

export interface ProfileData {
  user: { name: string; image: string | null };
  stats: {
    totalPlays: number;
    totalStreaks: number;
    uniqueSongs: number;
    weaknessCount: number;
  };
  bestStreak: {
    trackName: string;
    trackArtist: string;
    trackImage: string | null;
    trackId: string;
    count: number;
  } | null;
  activeStreak: {
    trackName: string;
    trackArtist: string;
    trackImage: string | null;
    trackId: string;
    count: number;
  } | null;
  history: {
    id: string;
    trackId: string;
    trackName: string;
    trackArtist: string;
    trackImage: string | null;
    count: number;
    active: boolean;
    startedAt: string;
    endedAt: string | null;
  }[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProfileView({ data }: { data: ProfileData }) {
  const bestMilestone = data.bestStreak
    ? getCurrentMilestone(data.bestStreak.count)
    : null;

  return (
    <main className="space-y-8">
      <header className="flex items-center gap-4">
        <div className="bg-foreground/10 flex flex-none items-center justify-center size-16 rounded-full">
          {data.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.user.image}
              alt={data.user.name}
              className="h-16 w-16 rounded-full"
            />
          ) : (
            <span className="font-decorative text-7xl text-background -translate-x-0.5 translate-y-0.5 uppercase">
              {data.user.name[0]}
            </span>
          )}
        </div>
        <div className="flex-auto space-y-1">
          <h1 className="text-2xl font-bold">{data.user.name}</h1>
          <p className="text-sm text-muted-foreground">
            {bestMilestone
              ? `${bestMilestone.badge} ${bestMilestone.label}`
              : "No milestones yet"}
          </p>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Plays", value: data.stats.totalPlays },
          { label: "Streaks", value: data.stats.totalStreaks },
          { label: "Songs", value: data.stats.uniqueSongs },
          { label: "Weaknesses", value: data.stats.weaknessCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-white/5 p-4 text-center"
          >
            <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Best Streak */}
      {data.bestStreak && data.bestStreak.count > 0 && (
        <List title="Best Streak" count={data.bestStreak.count}>
          <ListLink
            href={`/song/${data.bestStreak.trackId}`}
            className="bg-linear-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 hover:bg-yellow-500/5 transition"
          >
            {data.bestStreak.trackImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.bestStreak.trackImage}
                alt=""
                className="h-12 w-12 rounded-lg object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {data.bestStreak.trackName}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {data.bestStreak.trackArtist}
              </p>
            </div>
            <div className="text-right">
              {bestMilestone && (
                <span className="text-sm mr-1">{bestMilestone.badge}</span>
              )}
              <span className="text-2xl font-bold tabular-nums">
                {data.bestStreak.count}
              </span>
              <span className="ml-1 text-xs text-muted-foreground">plays</span>
            </div>
          </ListLink>
        </List>
      )}

      {/* Streak History */}
      <List title="Streak History" count={data.history.length}>
        {data.history.map((s) => {
          const milestone = getCurrentMilestone(s.count);
          return (
            <ListLink key={s.id} href={`/song/${s.trackId}`}>
              {s.trackImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.trackImage}
                  alt=""
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-white/10" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-sm">
                    {s.trackName}
                  </span>
                  {s.active && (
                    <span className="shrink-0 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] text-red-400">LIVE</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {s.trackArtist} &middot; {formatDate(s.startedAt)}
                  {s.endedAt && ` — ${formatDate(s.endedAt)}`}
                </p>
              </div>
              <div className="text-right shrink-0">
                {milestone && (
                  <span className="text-sm mr-1">{milestone.badge}</span>
                )}
                <span className="text-lg font-bold tabular-nums">
                  {s.count}
                </span>
                <span className="ml-1 text-xs text-muted-foreground">
                  plays
                </span>
              </div>
            </ListLink>
          );
        })}
      </List>
    </main>
  );
}
