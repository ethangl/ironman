import { prisma } from "@/lib/prisma";
import { Leaderboard } from "@/components/leaderboard";
import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ trackId: string }>;
}): Promise<Metadata> {
  const { trackId } = await params;

  const topStreak = await prisma.streak.findFirst({
    where: { trackId },
    orderBy: { count: "desc" },
    include: { user: { select: { name: true } } },
  });

  if (!topStreak) {
    return { title: "Leaderboard — ironman.fm" };
  }

  const title = `Who's the Iron Man for "${topStreak.trackName}"?`;
  const description = topStreak.count > 0
    ? `${topStreak.user.name ?? "Someone"} leads with ${topStreak.count} consecutive plays of "${topStreak.trackName}" by ${topStreak.trackArtist}. Can you beat them?`
    : `No one has claimed the Iron Man title for "${topStreak.trackName}" yet. Lock in and start your streak.`;

  return {
    title: `${topStreak.trackName} — ironman.fm`,
    description,
    openGraph: {
      title,
      description,
      siteName: "ironman.fm",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;

  const sample = await prisma.streak.findFirst({
    where: { trackId },
    select: { trackName: true, trackArtist: true, trackImage: true },
  });

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-xl px-4 py-8">
        {sample && (
          <div className="mb-8 flex items-center gap-4">
            {sample.trackImage && (
              <img
                src={sample.trackImage}
                alt=""
                className="h-16 w-16 rounded-xl object-cover"
              />
            )}
            <div>
              <h1 className="text-xl font-bold">{sample.trackName}</h1>
              <p className="text-zinc-400">{sample.trackArtist}</p>
            </div>
          </div>
        )}
        <Leaderboard
          trackId={trackId}
          title={sample ? "Iron Man Rankings" : "Leaderboard"}
        />
        <div className="mt-6 text-center">
          <a
            href="/dashboard"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition"
          >
            Back to dashboard
          </a>
        </div>
      </main>
    </div>
  );
}
