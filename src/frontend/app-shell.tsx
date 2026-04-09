import { Outlet } from "react-router-dom";

import { Navbar } from "@/components/navbar";
import { WebPlayerProvider } from "@/components/player/web-player-provider";
import { Toaster } from "@/components/ui/sonner";
import { AppRuntimeProvider } from "@/runtime/app-runtime";

export function AppShell() {
  return (
    <AppRuntimeProvider>
      <WebPlayerProvider>
        <Navbar />
        <Outlet />
        <Toaster />
      </WebPlayerProvider>
    </AppRuntimeProvider>
  );
}
