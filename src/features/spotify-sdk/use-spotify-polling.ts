import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from "react";

import type { SdkPlaybackState } from "@/features/spotify-client/playback-types";

import type {
  SpotifyPlaybackState,
  SpotifyPlayer,
} from "./spotify-sdk-types";

function mapSdkPlaybackState(state: SpotifyPlaybackState): SdkPlaybackState {
  return {
    position: state.position,
    duration: state.duration,
    paused: state.paused,
    trackId: state.track_window?.current_track?.id ?? null,
  };
}

export function useSpotifyPolling(trackId: string | null) {
  const [sdkState, setSdkState] = useState<SdkPlaybackState | null>(null);
  const sdkStateRef = useRef<SdkPlaybackState | null>(null);
  const positionPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const positionPollInFlightRef = useRef(false);
  const trackIdRef = useRef(trackId);

  useEffect(() => {
    trackIdRef.current = trackId;
  }, [trackId]);

  const stopPositionPolling = useCallback(() => {
    if (positionPollRef.current) {
      clearInterval(positionPollRef.current);
      positionPollRef.current = null;
    }
    positionPollInFlightRef.current = false;
  }, []);

  const clearSdkState = useCallback(() => {
    sdkStateRef.current = null;
    setSdkState(null);
    stopPositionPolling();
  }, [stopPositionPolling]);

  const startPositionPolling = useCallback(
    (player: SpotifyPlayer) => {
      stopPositionPolling();
      positionPollRef.current = setInterval(() => {
        if (positionPollInFlightRef.current) return;
        positionPollInFlightRef.current = true;
        void (async () => {
          try {
            const state = await player.getCurrentState();
            if (!state) return;

            const mapped = mapSdkPlaybackState(state);
            sdkStateRef.current = mapped;
            setSdkState(mapped);

            if (state.paused) {
              stopPositionPolling();
            }
          } catch (error) {
            console.error("[web-player] state poll failed:", error);
          } finally {
            positionPollInFlightRef.current = false;
          }
        })();
      }, 500);
    },
    [stopPositionPolling],
  );

  const handlePlayerStateChange = useCallback(
    (player: SpotifyPlayer, state: SpotifyPlaybackState | null) => {
      if (!state) {
        clearSdkState();
        return;
      }

      const mapped = mapSdkPlaybackState(state);
      sdkStateRef.current = mapped;
      setSdkState(mapped);

      if (!state.paused) {
        startPositionPolling(player);
      } else {
        stopPositionPolling();
      }
    },
    [clearSdkState, startPositionPolling, stopPositionPolling],
  );

  const isSdkActive = useCallback(
    (playerRef: MutableRefObject<SpotifyPlayer | null>) => {
      const state = sdkStateRef.current;
      return !!(
        playerRef.current &&
        state &&
        trackIdRef.current &&
        state.trackId === trackIdRef.current
      );
    },
    [],
  );

  return {
    clearSdkState,
    handlePlayerStateChange,
    isSdkActive,
    sdkState,
  };
}
