import { createBrowserRouter } from "react-router-dom";

import { Album } from "@/features/music/album";
import { Artist } from "@/features/music/artist";
import { Home } from "@/features/music/home";
import { Playlist } from "@/features/music/playlist";
import { HomeRoute, NotFoundRoute } from "@/routes";
import { AppShell } from "./app-shell";
import { AuthedLayout } from "./authed-layout";
import { RequireAuthenticatedSession } from "./require-authenticated-session";
import { RouteErrorBoundary } from "./route-error-boundary";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomeRoute /> },
      {
        element: <RequireAuthenticatedSession />,
        children: [
          {
            element: <AuthedLayout />,
            children: [
              { path: "home", element: <Home /> },
              { path: "artist/:artistId", element: <Artist /> },
              { path: "album/:albumId", element: <Album /> },
              { path: "playlist/:playlistId", element: <Playlist /> },
            ],
          },
        ],
      },
      { path: "*", element: <NotFoundRoute /> },
    ],
  },
]);
