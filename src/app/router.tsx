import { createBrowserRouter } from "react-router-dom";

import {
  ArtistResolveRoute,
  ArtistRoute,
  AuthedHomeRoute,
  HomeRoute,
  NotFoundRoute,
  ProfileRoute,
  PublicProfileRoute,
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
