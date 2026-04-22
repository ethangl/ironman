import { createBrowserRouter } from "react-router-dom";

import { SpotifyActivity } from "@/features/spotify-shell";
import {
  ArtistResolveRoute,
  ArtistRoute,
  HomeRoute,
  NotFoundRoute,
} from "@/routes";
import { AppShell } from "./app-shell";
import { AuthedLayout } from "./authed-layout";
import { RequireAuthenticatedSession } from "./require-authenticated-session";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <HomeRoute /> },
      {
        element: <RequireAuthenticatedSession />,
        children: [
          {
            element: <AuthedLayout />,
            children: [
              { path: "home", element: <SpotifyActivity /> },
              {
                path: "artist/resolve/:musicBrainzArtistId",
                element: <ArtistResolveRoute />,
              },
              { path: "artist/:artistId", element: <ArtistRoute /> },
            ],
          },
        ],
      },
      { path: "*", element: <NotFoundRoute /> },
    ],
  },
]);
