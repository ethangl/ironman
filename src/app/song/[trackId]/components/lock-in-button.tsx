"use client";

import { PlayIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useWebPlayer } from "@/hooks/use-web-player";
import { useSession } from "@/lib/auth-client";

export function LockInButton({
  trackId,
  trackName,
  trackArtist,
  trackImage,
  trackDuration,
}: {
  trackId: string;
  trackName: string;
  trackArtist: string;
  trackImage: string | null;
  trackDuration: number;
}) {
  const { data: session } = useSession();
  const { spotify } = useWebPlayer();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [hasActiveStreak, setHasActiveStreak] = useState<boolean | null>(null);

  if (!session) return null;

  const doLockIn = async (hardcore: boolean) => {
    setLoading(true);
    setConfirming(false);

    try {
      // Surrender existing streak if any
      if (hasActiveStreak) {
        await fetch("/api/ironman/surrender", { method: "POST" });
      }

      spotify.init();

      const body = {
        trackId,
        trackName,
        trackArtist,
        trackImage,
        trackDuration,
        hardcore,
      };

      // Try server-side playback
      const res = await fetch("/api/ironman/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push("/");
        return;
      }

      // SDK fallback
      if (res.status === 502) {
        const sdkDeviceId = await spotify.waitForReady();
        if (sdkDeviceId) {
          let playbackOk = false;
          for (let attempt = 0; attempt < 3; attempt++) {
            if (attempt > 0) await new Promise((r) => setTimeout(r, 1000));
            try {
              const playRes = await spotify.play(
                `spotify:track:${trackId}`,
                sdkDeviceId,
              );
              if (playRes.ok) {
                playbackOk = true;
                await spotify.setRepeat("track", sdkDeviceId);
                break;
              }
            } catch {}
          }

          if (playbackOk) {
            const streakRes = await fetch("/api/ironman/start", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...body, playbackStarted: true }),
            });
            if (streakRes.ok) {
              router.push("/");
              return;
            }
          }
        }
        alert(
          "Could not start playback. Please open Spotify on a device and try again.",
        );
      } else {
        const err = await res
          .json()
          .catch(() => ({ error: "Failed to start" }));
        alert(err.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async () => {
    const statusRes = await fetch("/api/ironman/status");
    const text = await statusRes.text();
    const active = !!(text && text !== "null");
    setHasActiveStreak(active);

    if (active) {
      setConfirming(true);
    } else {
      doLockIn(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-muted-foreground">
          This will end your current streak. Are you sure?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => doLockIn(false)}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-foreground hover:bg-red-500 transition disabled:opacity-50"
          >
            {loading ? "Locking in..." : "Lock In"}
          </button>
          <button
            onClick={() => doLockIn(true)}
            disabled={loading}
            className="rounded-lg bg-white/5 border border-red-500/50 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
          >
            Hardcore
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm text-foreground hover:bg-white/20 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <Button
      size="lg"
      onClick={handleClick}
      disabled={loading}
      className="bg-red-600 hover:bg-red-500"
    >
      <PlayIcon />
      {loading ? "Locking in..." : "Lock In"}
    </Button>
  );
}
