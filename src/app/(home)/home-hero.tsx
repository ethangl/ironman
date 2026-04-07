export function HomeHero() {
  return (
    <>
      <div className="py-24 text-center">
        <h1 className="text-6xl font-black tracking-tighter sm:text-7xl">
          ironman<span className="text-red-500">.fm</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-muted-foreground">
          Pick a song. Lock it in. Listen to it on repeat. Earn the{" "}
          <span className="font-semibold text-yellow-400">Iron Man </span> title
          &mdash; or surrender trying.
        </p>
      </div>

      {/* How it works */}
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
              desc: "Ironman mode activates. Try to play anything else — we'll force it back.",
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
