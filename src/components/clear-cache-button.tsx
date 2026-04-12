import { RotateCcwIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { clearSpotifyDevCache } from "@/data/spotify-convex-client";
import { clearSpotifyClientCaches } from "@/lib/spotify-client-cache";
import { Button } from "./ui/button";

export function ClearSpotifyCacheButton() {
  const [isClearing, setIsClearing] = useState(false);

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Clear Spotify cache"
      title="Clear Spotify cache"
      disabled={isClearing}
      onClick={async () => {
        setIsClearing(true);
        try {
          const [serverCleared, clientCleared] = await Promise.all([
            clearSpotifyDevCache(),
            Promise.resolve(clearSpotifyClientCaches()),
          ]);
          toast.success(
            `Cleared ${serverCleared + clientCleared} Spotify cache entr${serverCleared + clientCleared === 1 ? "y" : "ies"}. Reloading...`,
          );
          window.location.reload();
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not clear the Spotify cache.",
          );
          setIsClearing(false);
        }
      }}
    >
      <RotateCcwIcon className={isClearing ? "animate-spin" : undefined} />
    </Button>
  );
}
