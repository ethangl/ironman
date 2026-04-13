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
    activity: {
      favoriteArtists: FunctionReference<
        "action",
        "internal",
        { accessToken: string; cacheScope?: string; limit?: number },
        Array<{
          followerCount: number;
          genres: Array<string>;
          id: string;
          image: string | null;
          name: string;
        }>,
        Name
      >;
      playlistsPage: FunctionReference<
        "action",
        "internal",
        {
          accessToken: string;
          cacheScope?: string;
          limit?: number;
          offset?: number;
        },
        {
          items: Array<{
            description: string | null;
            id: string;
            image: string | null;
            name: string;
            owner: string | null;
            public: boolean;
            trackCount: number;
          }>;
          total: number;
        },
        Name
      >;
      playlistTracks: FunctionReference<
        "action",
        "internal",
        { accessToken: string; cacheScope?: string; playlistId: string },
        Array<{
          albumImage: string | null;
          albumName: string;
          artist: string;
          difficulty?: number;
          durationMs: number;
          id: string;
          name: string;
          topStreak?: { count: number; userName: string | null } | null;
        }>,
        Name
      >;
      recentlyPlayed: FunctionReference<
        "action",
        "internal",
        { accessToken: string; cacheScope?: string; limit?: number },
        {
          items: Array<{
            playedAt: string;
            track: {
              albumImage: string | null;
              albumName: string;
              artist: string;
              difficulty?: number;
              durationMs: number;
              id: string;
              name: string;
              topStreak?: { count: number; userName: string | null } | null;
            };
          }>;
          rateLimited: boolean;
        },
        Name
      >;
      topArtists: FunctionReference<
        "action",
        "internal",
        { accessToken: string; cacheScope?: string; limit?: number },
        Array<{
          followerCount: number;
          genres: Array<string>;
          id: string;
          image: string | null;
          name: string;
        }>,
        Name
      >;
    };
    cache: {
      clear: FunctionReference<"mutation", "internal", {}, number, Name>;
      get: FunctionReference<
        "query",
        "internal",
        { key: string },
        { expiresAt: number; value: string } | null,
        Name
      >;
      set: FunctionReference<
        "mutation",
        "internal",
        { expiresAt: number; key: string; value: string },
        null,
        Name
      >;
    };
    playback: {
      currentlyPlaying: FunctionReference<
        "action",
        "internal",
        { accessToken: string },
        {
          playback: {
            is_playing: boolean;
            item: {
              artists?: Array<{ name: string }>;
              duration_ms: number;
              id: string;
              name: string;
            } | null;
            progress_ms: number;
          } | null;
          status: number;
        },
        Name
      >;
      pause: FunctionReference<
        "action",
        "internal",
        { accessToken: string },
        { ok: boolean; status: number },
        Name
      >;
      play: FunctionReference<
        "action",
        "internal",
        { accessToken: string; deviceId?: string; uri: string },
        { ok: boolean; status: number },
        Name
      >;
      resume: FunctionReference<
        "action",
        "internal",
        { accessToken: string },
        { ok: boolean; status: number },
        Name
      >;
      setRepeat: FunctionReference<
        "action",
        "internal",
        {
          accessToken: string;
          deviceId?: string;
          state: "track" | "context" | "off";
        },
        { ok: boolean; status: number },
        Name
      >;
      setVolume: FunctionReference<
        "action",
        "internal",
        { accessToken: string; percent: number },
        { ok: boolean; status: number },
        Name
      >;
    };
    search: {
      artistPage: FunctionReference<
        "action",
        "internal",
        { accessToken: string; artistId: string; cacheScope?: string },
        {
          artist: {
            followerCount: number;
            genres: Array<string>;
            id: string;
            image: string | null;
            name: string;
          };
          releases: Array<{
            albumType: string | null;
            id: string;
            image: string | null;
            name: string;
            releaseDate: string | null;
            totalTracks: number;
          }>;
          topTracks: Array<{
            albumImage: string | null;
            albumName: string;
            artist: string;
            difficulty?: number;
            durationMs: number;
            id: string;
            name: string;
            topStreak?: { count: number; userName: string | null } | null;
          }>;
        } | null,
        Name
      >;
      searchResults: FunctionReference<
        "action",
        "internal",
        { accessToken: string; query: string },
        {
          artists: Array<{
            followerCount: number;
            genres: Array<string>;
            id: string;
            image: string | null;
            name: string;
          }>;
          playlists: Array<{
            description: string | null;
            id: string;
            image: string | null;
            name: string;
            owner: string | null;
            public: boolean;
            trackCount: number;
          }>;
          tracks: Array<{
            albumImage: string | null;
            albumName: string;
            artist: string;
            difficulty?: number;
            durationMs: number;
            id: string;
            name: string;
            topStreak?: { count: number; userName: string | null } | null;
          }>;
        },
        Name
      >;
      searchTracks: FunctionReference<
        "action",
        "internal",
        { accessToken: string; query: string },
        Array<{
          albumImage: string | null;
          albumName: string;
          artist: string;
          difficulty?: number;
          durationMs: number;
          id: string;
          name: string;
          topStreak?: { count: number; userName: string | null } | null;
        }>,
        Name
      >;
    };
  };
