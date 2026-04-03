"use client";

import { useSession, authClient } from "@/lib/auth-client";
import { useIronman } from "@/hooks/use-ironman";
import { Navbar } from "@/components/navbar";
import { SongSearch } from "@/components/song-search";
import { IronmanPanel } from "@/components/ironman-panel";
import { Leaderboard } from "@/components/leaderboard";
import { SpotifyTrack } from "@/types";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const { streak, loading, starting, startStreak, surrender } = useIronman();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      authClient.getAccessToken({ providerId: "spotify" }).then((res) => {
        if (res.data) setAccessToken(res.data.accessToken);
      });
    }
  }, [session]);

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="py-32 text-center text-zinc-400">
          <p>Sign in with Spotify to get started.</p>
        </div>
      </div>
    );
  }

  const handleSelect = async (track: SpotifyTrack) => {
    const result = await startStreak(track);
    if (!result.success) {
      alert(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        {streak?.active && accessToken ? (
          <IronmanPanel
            streak={streak}
            accessToken={accessToken}
            onSurrender={surrender}
          />
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold">Choose Your Song</h1>
              <p className="mt-2 text-zinc-400">
                Pick wisely. Once you lock in, there&apos;s no escape.
              </p>
            </div>

            <SongSearch onSelect={handleSelect} />

            {starting && (
              <div className="mt-4 text-center text-sm text-zinc-400">
                Locking in...
              </div>
            )}

            <div className="mt-12">
              <Leaderboard title="Top Iron Men" />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
