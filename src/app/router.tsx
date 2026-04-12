import { createBrowserRouter, Navigate, useParams } from "react-router-dom";

import {
  ArtistRoute,
  ChallengeRoute,
  HomeRoute,
  LiveRoute,
  NotFoundRoute,
  ProfileRoute,
  PublicProfileRoute,
  SongRoute,
} from "@/routes";
import { AppShell } from "./app-shell";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <HomeRoute /> },
      { path: "live", element: <LiveRoute /> },
      { path: "artist/:artistId", element: <ArtistRoute /> },
      { path: "challenge/:trackId", element: <ChallengeRoute /> },
      { path: "profile", element: <ProfileRoute /> },
      { path: "profile/:userId", element: <PublicProfileRoute /> },
      { path: "song/:trackId", element: <SongRoute /> },
      {
        path: "leaderboard/:trackId",
        element: <TrackLeaderboardRedirect />,
      },
      { path: "*", element: <NotFoundRoute /> },
    ],
  },
]);

function TrackLeaderboardRedirect() {
  const { trackId = "" } = useParams();
  return <Navigate to={`/song/${trackId}`} replace />;
}
