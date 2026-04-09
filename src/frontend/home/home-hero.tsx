import { ReactNode } from "react";

import { SpotifyStatus } from "@/runtime/app-runtime";

export function HomeHero({
  spotifyStatus,
  action,
}: {
  spotifyStatus?: SpotifyStatus;
  action?: ReactNode;
}) {
  return (
    <>
      <div className="py-24 text-center">
        <h1 className="text-6xl font-black tracking-tighter sm:text-7xl">
          ironman<span className="text-red-500">.fm</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-muted-foreground">
          Pick a song. Lock it in. Listen to it on repeat. Earn the{" "}
          <span className="font-semibold text-yellow-400">Iron Man </span> title
          or surrender trying.
        </p>
        {spotifyStatus && spotifyStatus.code !== "connected" ? (
          <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 text-left shadow-[0_24px_80px_rgba(0,0,0,0.2)]">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
              Spotify status
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight">
              {spotifyStatus.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {spotifyStatus.description}
            </p>
            {action ? <div className="mt-5">{action}</div> : null}
          </div>
        ) : null}
      </div>

      <div className="border-t border-white/5 py-16">
        <h2 className="text-center text-sm font-bold uppercase tracking-widest text-muted-foreground">
          How it works
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Choose your song",
              desc: "Search the entire Spotify catalog and pick your weapon.",
            },
            {
              step: "2",
              title: "Lock in",
              desc: "Ironman mode activates. Try to play anything else and we'll force it back.",
            },
            {
              step: "3",
              title: "Endure",
              desc: "Every full play counts. The most consecutive plays earns the Iron Man title.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-xl bg-white/5 p-5 text-center"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-sm font-bold text-red-400">
                {item.step}
              </div>
              <h3 className="font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
