import { AppLink } from "@/components/app-link";

export function LegacyRouteNotice({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="py-24">
      <section className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">
          Legacy Surface Retired
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight">{title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        <AppLink
          href="/"
          className="mt-8 inline-flex rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-foreground transition hover:bg-red-500"
        >
          Return to the rooms pivot
        </AppLink>
      </section>
    </main>
  );
}
