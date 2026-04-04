import type { Metadata } from "next";
import Link from "next/link";

import { Leaderboard } from "@/app/(home)/components/leaderboard";
import { prisma } from "@/lib/prisma";

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
  const description =
    topStreak.count > 0
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
    <main>
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
            <p className="text-muted-foreground">{sample.trackArtist}</p>
          </div>
        </div>
      )}
      <Leaderboard
        trackId={trackId}
        title={sample ? "Iron Man Rankings" : "Leaderboard"}
      />
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
