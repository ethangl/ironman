"use client";

import { useEffect, useState } from "react";

import { getCurrentMilestone, getNextMilestone } from "@/lib/milestones";

export function StreakCounter({ count }: { count: number }) {
  const [animate, setAnimate] = useState(false);
  const current = getCurrentMilestone(count);
  const next = getNextMilestone(count);

  useEffect(() => {
    if (count > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timer);
    }
  }, [count]);

  return (
    <div className="text-center">
      {current && (
        <div className="mb-2 text-sm text-yellow-400">
          {current.badge} {current.label}
        </div>
      )}
      <div
        className={`text-8xl font-black tabular-nums transition-transform duration-300 ${
          animate ? "scale-125 text-red-400" : "text-foreground"
        }`}
      >
        {count}
      </div>
      <div className="mt-2 text-sm uppercase tracking-widest text-muted-foreground">
        {count === 1 ? "play" : "plays"}
      </div>
      {next && (
        <div className="mt-2 text-xs text-muted-foreground">
          {next.badge} {next.label} at {next.threshold}
        </div>
      )}
    </div>
  );
}
