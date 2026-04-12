import { List, ListItem } from "@/components/list";
import { useLiveFeed } from "@/features/live";

const typeConfig: Record<string, { icon: string; verb: string }> = {
  lock_in: { icon: "🔒", verb: "locked in" },
  surrender: { icon: "🏳️", verb: "surrendered to" },
};

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function LiveRoute() {
  const { items, loading } = useLiveFeed();

  return (
    <main className="max-w-full">
      <List title="Live Feed" loading={loading} count={items.length}>
        {items.map((item) => {
          const config = typeConfig[item.type] ?? {
            icon: "📌",
            verb: "did something on",
          };
          return (
            <ListItem key={item.id}>
              <span className="mt-0.5 shrink-0 text-lg">{config.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-medium text-foreground">
                    {item.userName ?? "Anonymous"}
                  </span>{" "}
                  <span className="text-muted-foreground">{config.verb}</span>{" "}
                  <span className="text-foreground">{item.trackName}</span>
                </p>
                {item.detail ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.detail}
                  </p>
                ) : null}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {timeAgo(item.createdAt)}
              </span>
            </ListItem>
          );
        })}
      </List>
    </main>
  );
}
