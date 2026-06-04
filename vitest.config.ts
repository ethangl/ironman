import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@api": path.resolve(__dirname, "convex/_generated/api"),
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // Only `*.test.*` files are tests. confect uses the `*.spec.ts` suffix for
    // its (non-test) function specs, so the default glob would mis-collect them.
    include: ["**/*.test.{ts,tsx}"],
    // Vendored confect source and the preserved pre-migration backend are
    // reference-only — never run their tests.
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      ".confect-ref/**",
      ".migration-ref/**",
    ],
  },
});
