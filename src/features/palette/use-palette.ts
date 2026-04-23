import { useEffect, useState } from "react";

import { paletteClient } from "./palette-client";
import { PALETTE_STOP_COUNT } from "./palette";

export function usePalette(artworkUrl: string | null) {
  const [palette, setPalette] = useState<string[]>([]);

  useEffect(() => {
    const root = document.documentElement;

    if (!artworkUrl) {
      setPalette([]);
      clearPaletteVariables(root);
      return;
    }

    let cancelled = false;

    void paletteClient
      .get(artworkUrl)
      .then((colors) => {
        if (cancelled) return;
        setPalette(colors);
        applyPaletteVariables(root, colors);
      })
      .catch(() => {
        if (cancelled) return;
        setPalette([]);
        clearPaletteVariables(root);
      });

    return () => {
      cancelled = true;
      clearPaletteVariables(root);
    };
  }, [artworkUrl]);

  return palette;
}

function applyPaletteVariables(root: HTMLElement, colors: string[]) {
  colors.forEach((color, index) => {
    root.style.setProperty(`--palette-${index}`, color);
  });
}

function clearPaletteVariables(root: HTMLElement) {
  for (let i = 0; i < PALETTE_STOP_COUNT; i++) {
    root.style.removeProperty(`--palette-${i}`);
  }
}
