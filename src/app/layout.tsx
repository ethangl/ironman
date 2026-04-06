import type { Metadata } from "next";
import { Geist, Jacquard_12 } from "next/font/google";

import { Navbar } from "@/components/navbar";
import { WebPlayerProvider } from "@/components/player/web-player-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jacquard = Jacquard_12({
  variable: "--font-decorative",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ironman.fm",
  description: "One song. No mercy. Earn the title.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("antialiased dark", geistSans.variable, jacquard.variable)}
    >
      <body className="flex flex-col">
        <WebPlayerProvider>
          <Navbar />
          {children}
          <Toaster />
        </WebPlayerProvider>
      </body>
    </html>
  );
}
