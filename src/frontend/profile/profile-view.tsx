import { Avatar } from "@/components/avatar";
import { List, ListLink } from "@/components/list";
import { LogoutButton } from "@/components/logout-button";

export interface ProfileData {
  user: { id: string; name: string; image: string | null };
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
  return (
    <main className="space-y-8">
      <header className="flex items-center gap-4">
        <Avatar
          id={data.user.id}
          image={data.user.image}
          name={data.user.name}
        />
        <div className="flex-auto space-y-1">
          <h1 className="text-2xl font-bold">{data.user.name}</h1>
        </div>
        <LogoutButton />
      </header>

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
            <div className="mt-1 text-xs text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {data.bestStreak && data.bestStreak.count > 0 ? (
        <List title="Best Streak" count={data.bestStreak.count}>
          <ListLink
            href={`/song/${data.bestStreak.trackId}`}
            className="border border-yellow-500/20 bg-linear-to-r from-yellow-500/10 to-transparent transition hover:bg-yellow-500/5"
          >
            {data.bestStreak.trackImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.bestStreak.trackImage}
                alt=""
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {data.bestStreak.trackName}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {data.bestStreak.trackArtist}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold tabular-nums">
                {data.bestStreak.count}
              </span>
              <span className="ml-1 text-xs text-muted-foreground">plays</span>
            </div>
          </ListLink>
        </List>
      ) : null}

      <List title="Streak History" count={data.history.length}>
        {data.history.map((s) => (
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
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">
                  {s.trackName}
                </span>
                {s.active ? (
                  <span className="flex shrink-0 items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                    <span className="text-[10px] text-red-400">LIVE</span>
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                {s.trackArtist} &middot; {formatDate(s.startedAt)}
                {s.endedAt ? ` - ${formatDate(s.endedAt)}` : ""}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-lg font-bold tabular-nums">{s.count}</span>
              <span className="ml-1 text-xs text-muted-foreground">plays</span>
            </div>
          </ListLink>
        ))}
      </List>
    </main>
  );
}
