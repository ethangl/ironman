"use client";

import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/lib/auth-client";
import { BangersBoard } from "./components/bangers-board";
import { DashboardContent } from "./components/dashboard-content";
import { HellscapeBoard } from "./components/hellscape-board";
import { HomeHero } from "./components/home-hero";
import { IronmenBoard } from "./components/ironmen-board";
import { Leaderboard } from "./components/leaderboard";

export default function HomePage() {
  const { data: session, isPending } = useSession();

  return (
    <main className="max-w-full space-y-12">
      {isPending ? (
        <div className="flex items-center justify-center py-32">
          <Spinner />
        </div>
      ) : session ? (
        <DashboardContent />
      ) : (
        <HomeHero />
      )}
      <Separator />
      <div className="gap-8 grid lg:grid-cols-2 space-y-12">
        <div className="space-y-12">
          <HellscapeBoard />
          <Separator />
          <BangersBoard />
          <Separator className="lg:hidden" />
        </div>
        <div className="space-y-12">
          <IronmenBoard />
          <Separator />
          <Leaderboard />
        </div>
      </div>
    </main>
  );
}
