import { AppLink } from "@/components/app-link";

export function NotFoundRoute() {
  return (
    <main className="space-y-6 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
        Lost In The Noise
      </p>
      <h1 className="text-4xl font-black tracking-tight">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        The route you followed does not exist in the Vite frontend yet.
      </p>
      <AppLink
        href="/"
        className="inline-flex h-10 items-center rounded-4xl bg-white/10 px-4 text-sm font-medium transition hover:bg-white/15"
      >
        Back Home
      </AppLink>
    </main>
  );
}
