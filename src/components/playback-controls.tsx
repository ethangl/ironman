"use client";

import { useState } from "react";

export function PlaybackControls({
  accessToken,
  player,
  isSdkActive,
  paused: sdkPaused,
}: {
  accessToken: string;
  player: React.RefObject<any> | null;
  isSdkActive: boolean;
  paused?: boolean;
}) {
  const [localPaused, setLocalPaused] = useState(false);
  const [volume, setVolume] = useState(50);
  const [showVolume, setShowVolume] = useState(false);

  const paused = isSdkActive && sdkPaused !== undefined ? sdkPaused : localPaused;

  const togglePlay = async () => {
    if (isSdkActive && player?.current) {
      await player.current.togglePlay();
      return;
    }

    const endpoint = paused
      ? "https://api.spotify.com/v1/me/player/play"
      : "https://api.spotify.com/v1/me/player/pause";

    try {
      await fetch(endpoint, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setLocalPaused(!paused);
    } catch {}
  };

  const handleVolume = async (val: number) => {
    setVolume(val);

    if (isSdkActive && player?.current) {
      await player.current.setVolume(val / 100);
      return;
    }

    try {
      await fetch(
        `https://api.spotify.com/v1/me/player/volume?volume_percent=${val}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    } catch {}
  };

  return (
    <div className="flex items-center gap-3">
      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
        title={paused ? "Resume" : "Pause"}
      >
        {paused ? (
          <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        )}
      </button>

      {/* Volume */}
      <div className="relative">
        <button
          onClick={() => setShowVolume(!showVolume)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
          title="Volume"
        >
          {volume === 0 ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          ) : volume < 50 ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>

        {showVolume && (
          <div className="absolute bottom-full mb-2 rounded-xl bg-zinc-900 border border-white/10 p-3 shadow-xl">
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => handleVolume(Number(e.target.value))}
              className="h-1 w-24 accent-red-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}
