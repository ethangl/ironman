import { createBrowserRouter, Outlet } from "react-router-dom";

import { ArtistProvider } from "@/features/artist";
import { Artist } from "@/features/artist/artist";
import { SpotifyActivity } from "@/features/spotify-shell";
import { ArtistResolveRoute, HomeRoute, NotFoundRoute } from "@/routes";
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
              {
                path: "artist/:artistId",
                element: (
                  <ArtistProvider>
                    <Outlet />
                  </ArtistProvider>
                ),
                children: [
                  {
                    index: true,
                    element: <Artist />,
                  },
                ],
              },
            ],
          },
        ],
      },
      { path: "*", element: <NotFoundRoute /> },
    ],
  },
]);
