"use client";

import { useEffect } from "react";

export function PaletteVars({ colors }: { colors: string[] }) {
  useEffect(() => {
    const root = document.documentElement;
    colors.forEach((color, i) =>
      root.style.setProperty(`--palette-${i}`, color),
    );
    return () => {
      colors.forEach((_, i) => root.style.removeProperty(`--palette-${i}`));
    };
  }, [colors]);

  return null;
}
