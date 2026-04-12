import { useEffect, useState } from "react";

import { paletteClient } from "./palette-client";

export function usePlayerPalette(artworkUrl: string | null) {
  const [palette, setPalette] = useState<string[]>([]);

  useEffect(() => {
    const root = document.documentElement;

    if (!artworkUrl) {
      setPalette([]);
      for (let i = 0; i < 5; i++) {
        root.style.removeProperty(`--palette-${i}`);
      }
      return;
    }

    let cancelled = false;

    paletteClient
      .get(artworkUrl)
      .then((colors: string[]) => {
        if (cancelled) return;
        setPalette(colors);
        colors.forEach((color, index) => {
          root.style.setProperty(`--palette-${index}`, color);
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      for (let i = 0; i < 5; i++) {
        root.style.removeProperty(`--palette-${i}`);
      }
    };
  }, [artworkUrl]);

  return palette;
}
