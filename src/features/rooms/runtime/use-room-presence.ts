import { api } from "@api";
import { useConvex, useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";

import type { RoomId } from "../client/room-types";

const ROOM_PRESENCE_INTERVAL_MS = 10_000;
const ROOM_PRESENCE_SESSION_STORAGE_KEY = "rooms:presence-session-id";

function createRoomPresenceSessionId() {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `room-presence-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getRoomPresenceSessionId() {
  if (typeof window === "undefined") {
    return createRoomPresenceSessionId();
  }

  try {
    const existingSessionId = window.sessionStorage.getItem(
      ROOM_PRESENCE_SESSION_STORAGE_KEY,
    );
    if (existingSessionId) {
      return existingSessionId;
    }

    const nextSessionId = createRoomPresenceSessionId();
    window.sessionStorage.setItem(
      ROOM_PRESENCE_SESSION_STORAGE_KEY,
      nextSessionId,
    );
    return nextSessionId;
  } catch {
    return createRoomPresenceSessionId();
  }
}

export function useRoomPresence(roomId: RoomId | null) {
  const convex = useConvex();
  const heartbeat = useMutation(api.roomPresence.heartbeat);
  const disconnect = useMutation(api.roomPresence.disconnect);
  const [sessionId] = useState(getRoomPresenceSessionId);
  const sessionTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      return;
    }

    let cancelled = false;

    const sendHeartbeat = async () => {
      try {
        const result = await heartbeat({
          roomId,
          sessionId,
          interval: ROOM_PRESENCE_INTERVAL_MS,
        });

        if (cancelled) {
          await disconnect({ sessionToken: result.sessionToken });
          return;
        }

        sessionTokenRef.current = result.sessionToken;
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to update room presence.", error);
        }
      }
    };

    void sendHeartbeat();
    const intervalId = window.setInterval(() => {
      void sendHeartbeat();
    }, ROOM_PRESENCE_INTERVAL_MS);

    const handleUnload = () => {
      const sessionToken = sessionTokenRef.current;
      if (!sessionToken) {
        return;
      }

      const payload = new Blob(
        [
          JSON.stringify({
            path: "roomPresence:disconnect",
            args: { sessionToken },
          }),
        ],
        { type: "application/json" },
      );
      navigator.sendBeacon(`${convex.url}/api/mutation`, payload);
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);

      const sessionToken = sessionTokenRef.current;
      sessionTokenRef.current = null;

      if (sessionToken) {
        void disconnect({ sessionToken });
      }
    };
  }, [convex.url, disconnect, heartbeat, roomId, sessionId]);
}
