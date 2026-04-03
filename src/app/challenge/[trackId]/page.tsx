import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { Leaderboard } from "@/components/leaderboard";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ trackId: string }>;
}): Promise<Metadata> {
  const { trackId } = await params;

  const sample = await prisma.streak.findFirst({
    where: { trackId },
    orderBy: { count: "desc" },
    include: { user: { select: { name: true } } },
  });

  const trackName = sample?.trackName ?? "a song";
  const trackArtist = sample?.trackArtist ?? "";
  const leader = sample?.user.name;
  const count = sample?.count ?? 0;

  const title = `Can you survive "${trackName}"?`;
  const description = count > 0
    ? `${leader ?? "Someone"} holds the Iron Man title with ${count} plays of "${trackName}" by ${trackArtist}. Think you can beat them?`
    : `No one has claimed "${trackName}" by ${trackArtist} yet. Be the first Iron Man.`;

  return {
    title: `${trackName} Challenge — ironman.fm`,
    description,
    openGraph: { title, description, siteName: "ironman.fm", type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;

  const sample = await prisma.streak.findFirst({
    where: { trackId },
    orderBy: { count: "desc" },
    select: {
      trackName: true,
      trackArtist: true,
      trackImage: true,
      trackDuration: true,
      count: true,
    },
  });

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-xl px-4 py-12">
        <div className="text-center mb-10">
          <p className="text-sm font-bold uppercase tracking-widest text-red-400 mb-4">
            You&apos;ve been challenged
          </p>

          {sample?.trackImage && (
            <div className="relative mx-auto w-fit mb-6">
              <div className="absolute -inset-1 rounded-2xl bg-red-500/20 blur-xl" />
              <img
                src={sample.trackImage}
                alt=""
                className="relative h-40 w-40 rounded-2xl object-cover shadow-2xl"
              />
            </div>
          )}

          <h1 className="text-3xl font-black">
            {sample?.trackName ?? "Unknown Track"}
          </h1>
          <p className="text-zinc-400 mt-1">
            {sample?.trackArtist ?? ""}
          </p>

          {sample && sample.count > 0 && (
            <p className="mt-4 text-zinc-500">
              Current Iron Man has{" "}
              <span className="text-white font-bold">{sample.count}</span>{" "}
              consecutive plays. Can you beat that?
            </p>
          )}

          <Link
            href={`/?lockIn=${trackId}`}
            className="mt-8 inline-block rounded-xl bg-red-600 px-8 py-3 text-lg font-bold text-white hover:bg-red-500 transition"
          >
            Accept Challenge
          </Link>
        </div>

        <Leaderboard trackId={trackId} title="Current Rankings" />
      </main>
    </div>
  );
}
