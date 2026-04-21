import { useCallback } from "react";

import { useSpotifyControls } from "./use-spotify-controls";
import { useSpotifyPolling } from "./use-spotify-polling";
import { useSpotifySdk } from "./use-spotify-sdk";

export function useSpotify({
  getAccessToken,
  tokenRef,
  trackId,
}: {
  getAccessToken: () => Promise<string | null>;
  tokenRef: React.MutableRefObject<string | null>;
  trackId: string | null;
}) {
  const { clearSdkState, handlePlayerStateChange, isSdkActive, sdkState } =
    useSpotifyPolling(trackId);
  const { disconnect, init, playerRef, waitForReady } = useSpotifySdk({
    clearSdkState,
    getAccessToken,
    handlePlayerStateChange,
    tokenRef,
  });
  const controls = useSpotifyControls({
    isSdkActive: useCallback(() => isSdkActive(playerRef), [isSdkActive, playerRef]),
    playerRef,
  });

  return {
    init,
    disconnect,
    waitForReady,
    ...controls,
    sdkState,
  };
}
