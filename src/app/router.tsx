import { createBrowserRouter } from "react-router-dom";

import {
  ArtistResolveRoute,
  ArtistRoute,
  HomeRoute,
  NotFoundRoute,
  ProfileRoute,
  PublicProfileRoute,
  RoomRoute,
  SpotifyHomeRoute,
} from "@/routes";
import { AppShell } from "./app-shell";
import { AuthedLayout } from "./authed-layout";
import { RequireAuthenticatedSession } from "./require-authenticated-session";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        children: [
          { index: true, element: <HomeRoute /> },
          { path: "profile/:userId", element: <PublicProfileRoute /> },
          { path: "rooms/:roomId", element: <RoomRoute /> },
          { path: "*", element: <NotFoundRoute /> },
        ],
      },
      {
        element: <RequireAuthenticatedSession />,
        children: [
          {
            element: <AuthedLayout />,
            children: [
              { path: "home", element: <SpotifyHomeRoute /> },
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
