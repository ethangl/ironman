import { api } from "@api";
import { useMutation, useQuery } from "convex/react";
import {
  ListPlusIcon,
  MessageSquareIcon,
  Music2Icon,
  PanelRightCloseIcon,
  SendHorizontalIcon,
} from "lucide-react";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { AlbumArt } from "@/components/album-art";
import { Avatar } from "@/components/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarToggle,
  SidebarWrapper,
} from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useRoomDetails } from "../rooms/client/room-hooks";
import type {
  RoomActivityEvent,
  RoomActivityTrack,
  RoomId,
} from "../rooms/client/room-types";
import type { ResolvedRoomPlayback } from "../rooms/runtime/room-sync";
import { UserMenu } from "./user-menu";

function useRoomActivityJoinedAt(roomId: RoomId) {
  const joinedAtRef = useRef(Date.now());
  const roomIdRef = useRef(roomId);

  if (roomIdRef.current !== roomId) {
    roomIdRef.current = roomId;
    joinedAtRef.current = Date.now();
  }

  return joinedAtRef.current;
}

function useRoomActivityRecorder({
  joinedAt,
  resolvedPlayback,
  roomId,
}: {
  joinedAt: number;
  resolvedPlayback: ResolvedRoomPlayback | null;
  roomId: RoomId;
}) {
  const recordCurrentTrackStarted = useMutation(
    api.rooms.recordCurrentTrackStarted,
  );
  const recordedQueueItemsRef = useRef(new Set<string>());
  const currentQueueItemId = resolvedPlayback?.currentQueueItemId ?? null;
  const startedAt = resolvedPlayback?.startedAt ?? null;

  useEffect(() => {
    recordedQueueItemsRef.current.clear();
  }, [joinedAt, roomId]);

  useEffect(() => {
    if (!currentQueueItemId || startedAt === null || startedAt < joinedAt) {
      return;
    }

    const key = `${roomId}:${currentQueueItemId}`;
    if (recordedQueueItemsRef.current.has(key)) {
      return;
    }

    recordedQueueItemsRef.current.add(key);
    void recordCurrentTrackStarted({
      roomId,
      queueItemId: currentQueueItemId,
    }).catch(() => {
      recordedQueueItemsRef.current.delete(key);
    });
  }, [currentQueueItemId, joinedAt, recordCurrentTrackStarted, roomId, startedAt]);
}

function formatActivityTime(createdAt: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(createdAt));
}

function ActivityTrackSummary({ track }: { track: RoomActivityTrack }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <AlbumArt className="size-9 rounded-xl" src={track.trackImageUrl} />
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{track.trackName}</div>
        <div className="truncate text-xs text-muted-foreground">
          {track.trackArtists.join(", ")}
        </div>
      </div>
    </div>
  );
}

function RoomActivityItem({ event }: { event: RoomActivityEvent }) {
  const actorName = event.actor?.name ?? "Someone";
  const time = formatActivityTime(event.createdAt);

  if (event.kind === "chat_message") {
    return (
      <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-xl bg-section-color/5 p-2">
        <Avatar
          id={event.actor?.userId ?? event._id}
          image={event.actor?.image ?? null}
          name={event.actor?.name ?? null}
          sizeClassName="size-8 text-xl"
        />
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-sm font-medium">{actorName}</span>
            <time className="shrink-0 text-[11px] text-muted-foreground">
              {time}
            </time>
          </div>
          <p className="whitespace-pre-wrap break-words text-sm leading-snug">
            {event.body}
          </p>
        </div>
      </li>
    );
  }

  const isQueueAdded = event.kind === "queue_added";

  return (
    <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-xl bg-section-color/5 p-2">
      <div
        className={cn(
          "flex size-8 items-center justify-center rounded-full",
          isQueueAdded
            ? "bg-emerald-400/10 text-emerald-200"
            : "bg-sky-400/10 text-sky-200",
        )}
      >
        {isQueueAdded ? <ListPlusIcon /> : <Music2Icon />}
      </div>
      <div className="min-w-0 space-y-1.5">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-xs text-muted-foreground">
            {isQueueAdded ? `${actorName} added` : "Now playing"}
          </span>
          <time className="shrink-0 text-[11px] text-muted-foreground">
            {time}
          </time>
        </div>
        <ActivityTrackSummary track={event.track} />
      </div>
    </li>
  );
}

function RoomActivityComposer({ roomId }: { roomId: RoomId }) {
  const sendChatMessage = useMutation(api.rooms.sendChatMessage);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const trimmedBody = body.trim();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trimmedBody || sending) {
      return;
    }

    setSending(true);
    try {
      await sendChatMessage({ roomId, body: trimmedBody });
      setBody("");
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Message could not be sent.",
      );
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <form
      className="sticky bottom-0 flex gap-2 border-t border-background/20 bg-background/60 p-3 backdrop-blur"
      onSubmit={handleSubmit}
    >
      <Textarea
        aria-label="Message"
        className="max-h-28 min-h-10 rounded-xl py-2 text-sm"
        disabled={sending}
        maxLength={1000}
        onChange={(event) => setBody(event.currentTarget.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message"
        value={body}
      />
      <Button
        aria-label="Send"
        disabled={!trimmedBody || sending}
        size="icon"
        type="submit"
      >
        <SendHorizontalIcon />
      </Button>
    </form>
  );
}

function RoomActivity({
  joinedAt,
  roomId,
}: {
  joinedAt: number;
  roomId: RoomId;
}) {
  const events = useQuery(api.rooms.listActivity, {
    roomId,
    since: joinedAt,
    limit: 100,
  }) as RoomActivityEvent[] | undefined;

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1">
        {events === undefined ? (
          <div className="flex items-center justify-center p-6">
            <Spinner />
          </div>
        ) : events.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No new activity</div>
        ) : (
          <ol className="space-y-2 p-3">
            {events.map((event) => (
              <RoomActivityItem event={event} key={event._id} />
            ))}
          </ol>
        )}
      </div>
      <RoomActivityComposer roomId={roomId} />
    </div>
  );
}

export function Chat({ roomId }: { roomId: RoomId }) {
  const joinedAt = useRoomActivityJoinedAt(roomId);
  const roomQuery = useRoomDetails(roomId);
  useRoomActivityRecorder({
    joinedAt,
    resolvedPlayback: roomQuery.resolvedPlayback,
    roomId,
  });

  if (!roomQuery.data) {
    return null;
  }

  return (
    <Sidebar>
      <SidebarWrapper>
        <SidebarHeader title="Chat">
          <SidebarToggle
            collapseIcon={<PanelRightCloseIcon />}
            expandIcon={<MessageSquareIcon />}
          />
        </SidebarHeader>
        <SidebarContent>
          <RoomActivity joinedAt={joinedAt} roomId={roomId} />
        </SidebarContent>
      </SidebarWrapper>
      <SidebarWrapper className="flex-none h-16">
        <SidebarFooter>
          <UserMenu />
        </SidebarFooter>
      </SidebarWrapper>
    </Sidebar>
  );
}
