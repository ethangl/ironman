import { createBrowserRouter, Navigate, useParams } from "react-router-dom";

import { AppShell } from "@/frontend/app-shell";
import { ArtistRoute } from "@/frontend/routes/artist-route";
import { ChallengeRoute } from "@/frontend/routes/challenge-route";
import { HomeRoute } from "@/frontend/routes/home-route";
import { LiveRoute } from "@/frontend/routes/live-route";
import { NotFoundRoute } from "@/frontend/routes/not-found-route";
import { ProfileRoute } from "@/frontend/routes/profile-route";
import { PublicProfileRoute } from "@/frontend/routes/public-profile-route";
import { SongRoute } from "@/frontend/routes/song-route";

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
