"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { useWebPlayerContext } from "@/components/player/web-player-context";
import { useIronman } from "@/hooks/use-ironman";
import { SpotifyTrack } from "@/types";
import { IronmanPanel } from "./ironman-panel";
import { SongSearch } from "./song-search";

export function DashboardContent() {
  const { streak, loading, starting, startStreak, surrender } = useIronman();
  const { accessToken, refreshToken, initWebPlayer, waitForReady, playerRef } =
    useWebPlayerContext();
  const searchParams = useSearchParams();
  const autoLockInAttempted = useRef(false);

  // Auto lock-in from challenge link
  useEffect(() => {
    const lockInTrackId = searchParams.get("lockIn");
    if (
      !lockInTrackId ||
      !accessToken ||
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
  }, [accessToken, loading, streak, searchParams, startStreak]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-mist-500 border-t-white" />
      </div>
    );
  }

  const handleSelect = async (track: SpotifyTrack, hardcore = false) => {
    initWebPlayer();

    const result = await startStreak(track, hardcore);
    if (result.success) {
      await refreshToken();
      return;
    }

    if (result.status === 502 && accessToken) {
      const sdkDeviceId = await waitForReady();
      if (!sdkDeviceId) {
        alert(
          "Could not start playback. Please open Spotify on a device and try again.",
        );
        return;
      }

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
            await fetch(
              `https://api.spotify.com/v1/me/player/repeat?state=track&device_id=${sdkDeviceId}`,
              {
                method: "PUT",
                headers: { Authorization: `Bearer ${accessToken}` },
              },
            );
            break;
          }
          console.warn(
            "[dashboard] play attempt",
            attempt + 1,
            "failed:",
            playRes.status,
          );
        } catch {}
      }

      if (!playbackOk) {
        alert(
          "Could not start playback. Please open Spotify on a device and try again.",
        );
        return;
      }

      const streakResult = await startStreak(track, hardcore, {
        playbackStarted: true,
      });
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
    playerRef.current?.pause();
  };

  if (streak?.active) {
    return <IronmanPanel streak={streak} onSurrender={handleSurrender} />;
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Choose Your Song</h1>
        <p className="mt-2 text-muted-foreground">
          Pick wisely. Once you lock in, there&apos;s no escape.
        </p>
      </div>

      <SongSearch onSelect={handleSelect} />

      {starting && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Locking in...
        </div>
      )}
    </>
  );
}
