import { ComponentPropsWithoutRef, forwardRef } from "react";

import { AppLink } from "@/components/app-link";
import type { RoomId } from "../client/room-types";
import { useRoomPageHref } from "../runtime/use-room-page-state";

type RoomLinkProps = Omit<
  ComponentPropsWithoutRef<typeof AppLink>,
  "href" | "preserveSearch"
> & {
  roomId: RoomId | null;
};

export const RoomLink = forwardRef<HTMLAnchorElement, RoomLinkProps>(
  function RoomLink({ roomId, ...props }, ref) {
    const href = useRoomPageHref(roomId);

    return <AppLink ref={ref} href={href} preserveSearch={false} {...props} />;
  },
);
