import { Navbar } from "@/components/navbar";
import { Leaderboard } from "@/components/leaderboard";
import { LiveFeed } from "@/components/live-feed";
import { HellscapeBoard } from "@/components/hellscape-board";
import { IronmenBoard } from "@/components/ironmen-board";
import { BangersBoard } from "@/components/bangers-board";
import { HomeHero } from "@/components/home-hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4">
        <HomeHero />

        {/* Live feed */}
        <div className="border-t border-white/5 py-16">
          <LiveFeed />
        </div>

        {/* Greatest Iron Men (weighted) */}
        <div className="border-t border-white/5 py-16">
          <IronmenBoard />
        </div>

        {/* Hellscape Songs */}
        <div className="border-t border-white/5 py-16">
          <HellscapeBoard />
        </div>

        {/* Pure Bangers */}
        <div className="border-t border-white/5 py-16">
          <BangersBoard />
        </div>

        {/* Global leaderboard (raw count) */}
        <div className="border-t border-white/5 py-16">
          <Leaderboard title="Top Streaks" />
        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 text-center text-xs text-zinc-600">
          ironman.fm &mdash; One song. No mercy.
        </footer>
      </main>
    </div>
  );
}
