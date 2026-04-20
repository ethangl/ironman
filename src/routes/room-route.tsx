import { Navigate, useLocation, useParams } from "react-router-dom";

import type { RoomId } from "@/features/rooms";

export function RoomRoute() {
  const location = useLocation();
  const { roomId } = useParams<{ roomId: RoomId }>();
  const nextSearchParams = new URLSearchParams(location.search);

  if (roomId) {
    nextSearchParams.set("roomId", roomId);
  }

  const nextSearch = nextSearchParams.toString();
  return (
    <Navigate
      to={{
        pathname: "/",
        search: nextSearch ? `?${nextSearch}` : "",
      }}
      replace
    />
  );
}
