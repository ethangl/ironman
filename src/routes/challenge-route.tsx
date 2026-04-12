import { useParams } from "react-router-dom";

import { AppLink } from "@/components/app-link";
import { Leaderboard } from "@/features/leaderboards";
import { useSongStats } from "@/features/song";

export function ChallengeRoute() {
  const { trackId = "" } = useParams();
  const { stats, loading } = useSongStats(trackId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-mist-500 border-t-white" />
      </div>
    );
  }

  return (
    <main>
      <div className="mb-10 text-center">
        <p className="mb-4 text-sm font-bold uppercase tracking-widest text-red-400">
          You&apos;ve been challenged
        </p>

        {stats?.trackImage && (
          <div className="relative mx-auto mb-6 w-fit">
            <div className="absolute -inset-1 rounded-2xl bg-red-500/20 blur-xl" />
            <img
              src={stats.trackImage}
              alt=""
              className="relative h-40 w-40 rounded-2xl object-cover shadow-2xl"
            />
          </div>
        )}

        <h1 className="text-3xl font-black">
          {stats?.trackName ?? "Unknown Track"}
        </h1>
        <p className="mt-1 text-muted-foreground">{stats?.trackArtist ?? ""}</p>

        {stats?.ironMan && (
          <p className="mt-4 text-muted-foreground">
            Current Iron Man has{" "}
            <span className="font-bold text-foreground">
              {stats.ironMan.count}
            </span>{" "}
            consecutive plays. Can you beat that?
          </p>
        )}

        <AppLink
          href={`/?lockIn=${trackId}`}
          className="mt-8 inline-block rounded-xl bg-red-600 px-8 py-3 text-lg font-bold text-foreground transition hover:bg-red-500"
        >
          Accept Challenge
        </AppLink>
      </div>

      <Leaderboard trackId={trackId} title="Current Rankings" />
    </main>
  );
}
