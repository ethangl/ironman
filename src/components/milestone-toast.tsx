"use client";

import { useEffect, useState } from "react";
import type { Milestone } from "@/lib/milestones";

export function MilestoneToast({
  milestone,
  onDismiss,
}: {
  milestone: Milestone;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-4"
      }`}
    >
      <div className="rounded-2xl bg-zinc-900 border border-yellow-500/30 shadow-2xl px-6 py-4 text-center">
        <div className="text-4xl mb-1">{milestone.badge}</div>
        <div className="text-sm font-bold text-yellow-400 uppercase tracking-wider">
          {milestone.label}
        </div>
        <div className="text-xs text-zinc-400 mt-1">
          {milestone.threshold} plays reached
        </div>
      </div>
    </div>
  );
}
