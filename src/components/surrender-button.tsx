"use client";

import { useState } from "react";

export function SurrenderButton({ onSurrender }: { onSurrender: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSurrender = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ironman/surrender", { method: "POST" });
      if (res.ok) {
        onSurrender();
      }
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-zinc-400">
          Your streak will be lost forever. Are you sure?
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleSurrender}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-500 transition disabled:opacity-50"
          >
            {loading ? "Surrendering..." : "Yes, I surrender"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition"
          >
            Keep going
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:border-red-500 hover:text-red-400 transition"
    >
      Surrender
    </button>
  );
}
