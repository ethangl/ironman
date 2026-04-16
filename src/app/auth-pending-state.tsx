import { Spinner } from "@/components/ui/spinner";

export function AuthPendingState({
  title = "Checking your session",
  description = "We’re confirming whether your app session is ready before we load this route.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="flex min-h-72 flex-col items-center justify-center gap-4 px-4 text-center">
      <Spinner className="h-8 w-8 border-[3px]" />
      <div className="space-y-2">
        <h1 className="text-2xl font-black tracking-tight">{title}</h1>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}
