import { useCallback, useRef, type MutableRefObject } from "react";

import type { PlayResult } from "@/types/spotify-playback";

import {
  WRONG_SONG_CORRECTION_GRACE_MS,
  logEnforcement,
  logEnforcementError,
} from "./enforcement-runtime";

export function useWrongSongEnforcement({
  brokenRef,
  canEnforceNow,
  cancelPauseTimer,
  handleWeakness,
  play,
  setRepeat,
  trackId,
  setPlayingState,
}: {
  brokenRef: MutableRefObject<boolean>;
  canEnforceNow: () => boolean;
  cancelPauseTimer: () => void;
  handleWeakness: (
    type: "paused" | "quit" | "wrong_song",
    detail?: string,
  ) => Promise<void>;
  play: (uri: string, deviceId?: string) => Promise<PlayResult>;
  setRepeat: (state: string, deviceId?: string) => Promise<void>;
  trackId: string;
  setPlayingState: () => void;
}) {
  const correctionInFlightRef = useRef(false);
  const correctionCooldownUntilRef = useRef(0);
  const wrongSongIncidentRef = useRef<string | null>(null);

  const forceCorrectTrack = useCallback(async () => {
    logEnforcement("correction play requested", { trackId });
    const playRes = await play(`spotify:track:${trackId}`);
    if (!playRes.ok) {
      logEnforcement("correction play failed", {
        trackId,
        status: playRes.status,
      });
      return false;
    }

    correctionCooldownUntilRef.current =
      Date.now() + WRONG_SONG_CORRECTION_GRACE_MS;
    await setRepeat("track");
    logEnforcement("correction applied", {
      trackId,
      cooldownMs: WRONG_SONG_CORRECTION_GRACE_MS,
    });
    return true;
  }, [play, setRepeat, trackId]);

  const handleWrongSong = useCallback(
    async (options?: { detail?: string; signature?: string | null }) => {
      const detail = options?.detail;
      const incidentKey = options?.signature ?? detail ?? "__unknown__";

      if (!canEnforceNow()) {
        logEnforcement("wrong song ignored: follower tab", { detail });
        return;
      }
      if (correctionInFlightRef.current) {
        logEnforcement("wrong song ignored: correction in flight", { detail });
        return;
      }
      if (brokenRef.current) {
        logEnforcement("wrong song ignored: streak already broken", { detail });
        return;
      }
      if (Date.now() < correctionCooldownUntilRef.current) {
        logEnforcement("wrong song ignored: in correction grace window", {
          detail,
          remainingMs: correctionCooldownUntilRef.current - Date.now(),
        });
        return;
      }

      logEnforcement("wrong song detected", {
        detail,
        expectedTrackId: trackId,
      });
      correctionInFlightRef.current = true;
      setPlayingState();
      cancelPauseTimer();

      try {
        if (wrongSongIncidentRef.current !== incidentKey) {
          wrongSongIncidentRef.current = incidentKey;
          await handleWeakness("wrong_song", detail);
        } else {
          logEnforcement("wrong song incident already recorded", {
            detail,
            incidentKey,
          });
        }

        if (!brokenRef.current) {
          await forceCorrectTrack();
        }
      } catch (error) {
        logEnforcementError("wrong song handling failed", error);
      } finally {
        correctionInFlightRef.current = false;
      }
    },
    [
      brokenRef,
      canEnforceNow,
      cancelPauseTimer,
      forceCorrectTrack,
      handleWeakness,
      setPlayingState,
      trackId,
    ],
  );

  const resetWrongSongState = useCallback(() => {
    wrongSongIncidentRef.current = null;
    correctionCooldownUntilRef.current = 0;
  }, []);

  const clearWrongSongRuntime = useCallback(() => {
    correctionInFlightRef.current = false;
    wrongSongIncidentRef.current = null;
    correctionCooldownUntilRef.current = 0;
  }, []);

  return {
    clearWrongSongRuntime,
    handleWrongSong,
    resetWrongSongState,
  };
}
