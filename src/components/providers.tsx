"use client";

import { WebPlayerProvider } from "./web-player-context";
import { NowPlayingBar } from "./now-playing-bar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WebPlayerProvider>
      <div className="pb-16">{children}</div>
      <NowPlayingBar />
    </WebPlayerProvider>
  );
}
