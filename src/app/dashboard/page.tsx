"use client";

import { useSession, authClient } from "@/lib/auth-client";
import { useIronman } from "@/hooks/use-ironman";
import { useWebPlayer } from "@/components/web-player";
import { Navbar } from "@/components/navbar";
import { SongSearch } from "@/components/song-search";
import { IronmanPanel } from "@/components/ironman-panel";
import { Leaderboard } from "@/components/leaderboard";
import { SpotifyTrack } from "@/types";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const { streak, loading, starting, startStreak, surrender } = useIronman();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const autoLockInAttempted = useRef(false);

  const { init: initWebPlayer, disconnect: disconnectWebPlayer, waitForReady, sdkState, playerRef } =
    useWebPlayer(accessToken);

  const refreshToken = async () => {
    const res = await authClient.getAccessToken({ providerId: "spotify" });
    if (res.data) setAccessToken(res.data.accessToken);
    return res.data?.accessToken ?? null;
  };

  useEffect(() => {
    if (session) refreshToken();
  }, [session]);

  // Auto lock-in from challenge link (no user gesture — can't use web player fallback)
  useEffect(() => {
    const lockInTrackId = searchParams.get("lockIn");
    if (
      !lockInTrackId ||
      !accessToken ||
      !session ||
      loading ||
      streak?.active ||
      autoLockInAttempted.current
    )
      return;

    autoLockInAttempted.current = true;

    fetch(`/api/search?q=track:${lockInTrackId}`)
      .then((r) => r.json())
      .then((tracks: SpotifyTrack[]) => {
        const match = tracks.find((t) => t.id === lockInTrackId);
        if (match) startStreak(match);
      })
      .catch(() => {});
  }, [accessToken, session, loading, streak, searchParams, startStreak]);

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

  const handleSelect = async (track: SpotifyTrack, hardcore = false) => {
    // Synchronously init web player in click context (activateElement)
    initWebPlayer();

    // Try starting on existing active device (server handles playback)
    const result = await startStreak(track, hardcore);
    if (result.success) {
      // Server may have refreshed the token — get the latest for enforcement engine
      await refreshToken();
      return;
    }

    // No active device — use web player SDK (client handles playback)
    if (result.status === 502 && accessToken) {
      const sdkDeviceId = await waitForReady();
      if (!sdkDeviceId) {
        alert("Could not start playback. Please open Spotify on a device and try again.");
        return;
      }

      // Start playback client-side (same token the SDK registered with)
      let playbackOk = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) await new Promise((r) => setTimeout(r, 1000));
        try {
          const playRes = await fetch(
            `https://api.spotify.com/v1/me/player/play?device_id=${sdkDeviceId}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ uris: [`spotify:track:${track.id}`] }),
            },
          );
          if (playRes.ok || playRes.status === 204) {
            playbackOk = true;
            // Set repeat mode
            await fetch(
              `https://api.spotify.com/v1/me/player/repeat?state=track&device_id=${sdkDeviceId}`,
              {
                method: "PUT",
                headers: { Authorization: `Bearer ${accessToken}` },
              },
            );
            break;
          }
          console.warn("[dashboard] play attempt", attempt + 1, "failed:", playRes.status);
        } catch {}
      }

      if (!playbackOk) {
        alert("Could not start playback. Please open Spotify on a device and try again.");
        return;
      }

      // Playback started — tell server to create the streak (skip server-side playback)
      const streakResult = await startStreak(track, hardcore, { playbackStarted: true });
      if (streakResult.success) {
        await refreshToken();
      } else {
        alert(streakResult.error);
      }
    } else if (!result.success) {
      alert(result.error);
    }
  };

  const handleSurrender = () => {
    surrender();
    // Pause playback but keep SDK player alive for subsequent streaks
    playerRef.current?.pause();
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        {streak?.active && accessToken ? (
          <IronmanPanel
            streak={streak}
            accessToken={accessToken}
            onSurrender={handleSurrender}
            onTokenExpired={refreshToken}
            sdkState={sdkState}
            playerRef={playerRef}
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
