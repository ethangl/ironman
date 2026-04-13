import { RotateCcwIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { clearSpotifyDevCache } from "@/features/spotify/client";

export function ClearSpotifyCacheButton() {
  const [isClearing, setIsClearing] = useState(false);

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Clear Spotify server cache"
      title="Clear Spotify server cache"
      disabled={isClearing}
      onClick={async () => {
        setIsClearing(true);
        try {
          const serverCleared = await clearSpotifyDevCache();
          toast.success(
            `Cleared ${serverCleared} Spotify server cache entr${serverCleared === 1 ? "y" : "ies"}. Reloading...`,
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
