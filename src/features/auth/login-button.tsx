import { Clock3Icon } from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { useAppAuth } from "@/app/app-runtime";
import { Button } from "@/components/ui/button";
import {
  replaceBrowserUrl,
  useBrowserSearchParams,
} from "@/hooks/use-browser-search-params";
import {
  convexLinkSocialAccount,
  fetchSpotifyAuthCooldown,
} from "@/lib/convex-auth-client";

const SPOTIFY_AUTH_PROVIDER = "spotify";
const SPOTIFY_AUTH_COOLDOWN_KEY = "spotify-auth-cooldown-until";
const SPOTIFY_AUTH_COOLDOWN_EVENT = "spotify-auth-cooldown-change";
const SPOTIFY_AUTH_COOLDOWN_MS = 60_000;

function formatCooldownWindow(ms: number) {
  const totalSeconds = Math.max(Math.ceil(ms / 1000), 0);
  if (totalSeconds < 90) {
    return "about a minute";
  }

  const totalMinutes = Math.ceil(totalSeconds / 60);
  if (totalMinutes < 90) {
    return `about ${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) {
    return `about ${hours} hour${hours === 1 ? "" : "s"}`;
  }

  return `about ${hours}h ${minutes}m`;
}

function getStoredCooldownUntil() {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(SPOTIFY_AUTH_COOLDOWN_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function setStoredCooldownUntil(until: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SPOTIFY_AUTH_COOLDOWN_KEY, String(until));
  window.dispatchEvent(new Event(SPOTIFY_AUTH_COOLDOWN_EVENT));
}

function clearStoredCooldown() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SPOTIFY_AUTH_COOLDOWN_KEY);
  window.dispatchEvent(new Event(SPOTIFY_AUTH_COOLDOWN_EVENT));
}

function subscribeToSpotifyCooldown(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const listener = () => onStoreChange();
  window.addEventListener("storage", listener);
  window.addEventListener(SPOTIFY_AUTH_COOLDOWN_EVENT, listener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(SPOTIFY_AUTH_COOLDOWN_EVENT, listener);
  };
}

export function LoginButton() {
  const { session, isPending, signIn } = useAppAuth();
  const searchParams = useBrowserSearchParams();
  const [now, setNow] = useState(() => Date.now());
  const cooldownUntil = useSyncExternalStore(
    subscribeToSpotifyCooldown,
    getStoredCooldownUntil,
    () => 0,
  );
  const authError = searchParams.get("error");
  const authProvider = searchParams.get("authProvider");

  useEffect(() => {
    if (
      authProvider !== SPOTIFY_AUTH_PROVIDER ||
      authError !== "unable_to_get_user_info"
    ) {
      return;
    }

    let cancelled = false;

    void fetchSpotifyAuthCooldown()
      .catch(() => null)
      .then((cooldown) => {
        if (cancelled) {
          return;
        }

        const until =
          cooldown?.cooldownUntil &&
          Number.isFinite(cooldown.cooldownUntil) &&
          cooldown.cooldownUntil > Date.now()
            ? cooldown.cooldownUntil
            : Date.now() + SPOTIFY_AUTH_COOLDOWN_MS;
        setStoredCooldownUntil(until);
        toast.error(
          `Spotify is cooling down. Try reconnecting ${formatCooldownWindow(until - Date.now())}.`,
        );

        const nextParams = new URLSearchParams(searchParams.toString());
        nextParams.delete("error");
        nextParams.delete("authProvider");
        const nextQuery = nextParams.toString();
        replaceBrowserUrl(nextQuery ? `/?${nextQuery}` : "/");
      });

    return () => {
      cancelled = true;
    };
  }, [authError, authProvider, searchParams]);

  useEffect(() => {
    if (cooldownUntil <= now) return;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownUntil, now]);

  useEffect(() => {
    if (cooldownUntil > now) return;
    if (!cooldownUntil) return;
    clearStoredCooldown();
  }, [cooldownUntil, now]);

  const cooldownRemainingMs = Math.max(cooldownUntil - now, 0);
  const cooldownSeconds = Math.ceil(cooldownRemainingMs / 1000);
  const isCoolingDown = cooldownRemainingMs > 0;
  const cooldownLabel = useMemo(() => {
    if (!isCoolingDown) return null;
    if (cooldownSeconds >= 60) {
      return "Spotify cooling down";
    }
    return `Retry in ${cooldownSeconds}s`;
  }, [cooldownSeconds, isCoolingDown]);

  if (isPending) {
    return <div className="h-10 w-24 animate-pulse rounded-lg bg-white/10" />;
  }

  const buttonLabel = session ? "Reconnect Spotify" : "Sign in with Spotify";

  const startSpotifyAuth = () => {
    const payload = {
      provider: "spotify" as const,
      callbackURL: "/",
      errorCallbackURL: "/?authProvider=spotify",
    };

    if (session) {
      return convexLinkSocialAccount(payload);
    }

    return signIn.social(payload);
  };

  return (
    <Button
      disabled={isCoolingDown}
      onClick={startSpotifyAuth}
      className=" bg-[#1DB954] font-semibold gap-2.5 pr-4 text-sm text-mist-950 hover:bg-[#1ed760] disabled:bg-[#1DB954]/45 disabled:text-mist-950/80"
    >
      {isCoolingDown ? (
        <Clock3Icon className="h-4 w-4" />
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      )}
      {isCoolingDown ? (cooldownLabel ?? "Spotify cooling down") : buttonLabel}
    </Button>
  );
}
