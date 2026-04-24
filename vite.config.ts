import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const LOCAL_DEV_HOST = "127.0.0.1";

export default defineConfig({
  envPrefix: ["VITE_", "CONVEX_"],
  plugins: [react()],
  resolve: {
    alias: {
      "@api": path.resolve(__dirname, "convex/_generated/api"),
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  server: {
    host: LOCAL_DEV_HOST,
    proxy: {
      "/api": "http://127.0.0.1:3000",
    },
  },
  preview: {
    host: LOCAL_DEV_HOST,
  },
});
