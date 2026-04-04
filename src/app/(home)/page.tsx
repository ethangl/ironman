import { Separator } from "@/components/ui/separator";
import { BangersBoard } from "./components/bangers-board";
import { HellscapeBoard } from "./components/hellscape-board";
import { HomeHero } from "./components/home-hero";
import { IronmenBoard } from "./components/ironmen-board";
import { Leaderboard } from "./components/leaderboard";
import { LiveFeed } from "./components/live-feed";

export default function HomePage() {
  return (
    <main className="max-w-full space-y-12">
      <HomeHero />
      <Separator />
      <div className="gap-8 grid lg:grid-cols-2 space-y-12">
        <div className="space-y-12">
          <IronmenBoard />
          <Separator />
          <HellscapeBoard />
          <Separator />
          <BangersBoard />
          <Separator />
          <Leaderboard />
          <Separator className="lg:hidden" />
        </div>
        <LiveFeed />
      </div>
    </main>
  );
}
