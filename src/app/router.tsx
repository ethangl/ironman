import { createBrowserRouter, Navigate, useParams } from "react-router-dom";

import {
  ArtistRoute,
  ArtistResolveRoute,
  AuthedHomeRoute,
  ChallengeRoute,
  HomeRoute,
  LiveRoute,
  NotFoundRoute,
  ProfileRoute,
  PublicProfileRoute,
  SongRoute,
} from "@/routes";
import { AppShell } from "./app-shell";
import { AuthedLayout } from "./authed-layout";
import { PublicLayout } from "./public-layout";
import { RequireAuthenticatedSession } from "./require-authenticated-session";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: <HomeRoute /> },
          { path: "live", element: <LiveRoute /> },
          { path: "challenge/:trackId", element: <ChallengeRoute /> },
          { path: "profile/:userId", element: <PublicProfileRoute /> },
          { path: "song/:trackId", element: <SongRoute /> },
          {
            path: "leaderboard/:trackId",
            element: <TrackLeaderboardRedirect />,
          },
          { path: "*", element: <NotFoundRoute /> },
        ],
      },
      {
        element: <RequireAuthenticatedSession />,
        children: [
          {
            element: <AuthedLayout />,
            children: [
              { path: "home", element: <AuthedHomeRoute /> },
              {
                path: "artist/resolve/:musicBrainzArtistId",
                element: <ArtistResolveRoute />,
              },
              { path: "artist/:artistId", element: <ArtistRoute /> },
              { path: "profile", element: <ProfileRoute /> },
            ],
          },
        ],
      },
    ],
  },
]);

function TrackLeaderboardRedirect() {
  const { trackId = "" } = useParams();
  return <Navigate to={`/song/${trackId}`} replace />;
}
