/* eslint-disable */
/**
 * Generated `ComponentApi` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

/**
 * A utility for referencing a Convex component's exposed API.
 *
 * Useful when expecting a parameter like `components.myComponent`.
 * Usage:
 * ```ts
 * async function myFunction(ctx: QueryCtx, component: ComponentApi) {
 *   return ctx.runQuery(component.someFile.someQuery, { ...args });
 * }
 * ```
 */
export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
    artists: {
      artistBySpotifyId: FunctionReference<
        "action",
        "internal",
        { spotifyArtistId: string },
        {
          artist: {
            country: string | null;
            disambiguation: string | null;
            id: string;
            musicBrainzUrl: string;
            name: string;
            sortName: string | null;
            spotifyUrl: string;
            type: string | null;
          };
          links: {
            bandcamp: string | null;
            homepage: string | null;
            instagram: string | null;
            youtube: string | null;
          };
          matchCount: number;
          resolvedVia: "spotify_url";
          spotifyArtistId: string;
          spotifyUrl: string;
        } | null,
        Name
      >;
      spotifyArtistIdByMusicBrainzId: FunctionReference<
        "action",
        "internal",
        { musicBrainzArtistId: string },
        string | null,
        Name
      >;
    };
    scheduler: {
      reserve: FunctionReference<
        "mutation",
        "internal",
        { intervalMs: number; key: string },
        number,
        Name
      >;
    };
  };
