"use client";

import { useEffect, useState } from "react";

export function StreakCounter({ count }: { count: number }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (count > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timer);
    }
  }, [count]);

  return (
    <div className="text-center">
      <div
        className={`text-8xl font-black tabular-nums transition-transform duration-300 ${
          animate ? "scale-125 text-red-400" : "text-white"
        }`}
      >
        {count}
      </div>
      <div className="mt-2 text-sm uppercase tracking-widest text-zinc-500">
        {count === 1 ? "play" : "plays"}
      </div>
    </div>
  );
}
