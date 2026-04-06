"use client";

import { SkullIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useWebPlayer } from "@/hooks/use-web-player";

export function SurrenderButton() {
  const { surrender } = useWebPlayer();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSurrender = async () => {
    setLoading(true);
    try {
      await surrender();
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-muted-foreground">
          Your streak will be lost forever. Are you sure?
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleSurrender}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-foreground hover:bg-red-500 transition disabled:opacity-50"
          >
            {loading ? "Surrendering..." : "Yes, I surrender"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm text-foreground hover:bg-white/20 transition"
          >
            Keep going
          </button>
        </div>
      </div>
    );
  }

  return (
    <Button variant="destructive" onClick={() => setConfirming(true)}>
      <SkullIcon />
      Surrender
    </Button>
  );
}
