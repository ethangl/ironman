/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as betterAuth from "../betterAuth.js";
import type * as betterAuthCrossDomain from "../betterAuthCrossDomain.js";
import type * as http from "../http.js";
import type * as lastfm from "../lastfm.js";
import type * as musicbrainz from "../musicbrainz.js";
import type * as profile from "../profile.js";
import type * as rooms from "../rooms.js";
import type * as spotify from "../spotify.js";
import type * as spotify_albums from "../spotify/albums.js";
import type * as spotify_albumsCache from "../spotify/albumsCache.js";
import type * as spotify_albumsLoaders from "../spotify/albumsLoaders.js";
import type * as spotify_artists from "../spotify/artists.js";
import type * as spotify_artistsCache from "../spotify/artistsCache.js";
import type * as spotify_artistsLoaders from "../spotify/artistsLoaders.js";
import type * as spotify_playback from "../spotify/playback.js";
import type * as spotify_playlists from "../spotify/playlists.js";
import type * as spotify_playlistsCache from "../spotify/playlistsCache.js";
import type * as spotify_playlistsLoaders from "../spotify/playlistsLoaders.js";
import type * as spotify_search from "../spotify/search.js";
import type * as spotify_searchCache from "../spotify/searchCache.js";
import type * as spotify_searchLoaders from "../spotify/searchLoaders.js";
import type * as spotify_tracks from "../spotify/tracks.js";
import type * as spotify_tracksCache from "../spotify/tracksCache.js";
import type * as spotify_tracksLoaders from "../spotify/tracksLoaders.js";
import type * as spotifyAuthCooldown from "../spotifyAuthCooldown.js";
import type * as spotifySession from "../spotifySession.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  betterAuth: typeof betterAuth;
  betterAuthCrossDomain: typeof betterAuthCrossDomain;
  http: typeof http;
  lastfm: typeof lastfm;
  musicbrainz: typeof musicbrainz;
  profile: typeof profile;
  rooms: typeof rooms;
  spotify: typeof spotify;
  "spotify/albums": typeof spotify_albums;
  "spotify/albumsCache": typeof spotify_albumsCache;
  "spotify/albumsLoaders": typeof spotify_albumsLoaders;
  "spotify/artists": typeof spotify_artists;
  "spotify/artistsCache": typeof spotify_artistsCache;
  "spotify/artistsLoaders": typeof spotify_artistsLoaders;
  "spotify/playback": typeof spotify_playback;
  "spotify/playlists": typeof spotify_playlists;
  "spotify/playlistsCache": typeof spotify_playlistsCache;
  "spotify/playlistsLoaders": typeof spotify_playlistsLoaders;
  "spotify/search": typeof spotify_search;
  "spotify/searchCache": typeof spotify_searchCache;
  "spotify/searchLoaders": typeof spotify_searchLoaders;
  "spotify/tracks": typeof spotify_tracks;
  "spotify/tracksCache": typeof spotify_tracksCache;
  "spotify/tracksLoaders": typeof spotify_tracksLoaders;
  spotifyAuthCooldown: typeof spotifyAuthCooldown;
  spotifySession: typeof spotifySession;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  actionCache: {
    crons: {
      purge: FunctionReference<
        "mutation",
        "internal",
        { expiresAt?: number },
        null
      >;
    };
    lib: {
      get: FunctionReference<
        "query",
        "internal",
        { args: any; name: string; ttl: number | null },
        { kind: "hit"; value: any } | { expiredEntry?: string; kind: "miss" }
      >;
      put: FunctionReference<
        "mutation",
        "internal",
        {
          args: any;
          expiredEntry?: string;
          name: string;
          ttl: number | null;
          value: any;
        },
        { cacheHit: boolean; deletedExpiredEntry: boolean }
      >;
      remove: FunctionReference<
        "mutation",
        "internal",
        { args: any; name: string },
        null
      >;
      removeAll: FunctionReference<
        "mutation",
        "internal",
        { batchSize?: number; before?: number; name?: string },
        null
      >;
    };
  };
  betterAuth: {
    adapter: {
      create: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                data: {
                  createdAt: number;
                  displayUsername?: null | string;
                  email: string;
                  emailVerified: boolean;
                  image?: null | string;
                  isAnonymous?: null | boolean;
                  name: string;
                  phoneNumber?: null | string;
                  phoneNumberVerified?: null | boolean;
                  twoFactorEnabled?: null | boolean;
                  updatedAt: number;
                  userId?: null | string;
                  username?: null | string;
                };
                model: "user";
              }
            | {
                data: {
                  createdAt: number;
                  expiresAt: number;
                  ipAddress?: null | string;
                  token: string;
                  updatedAt: number;
                  userAgent?: null | string;
                  userId: string;
                };
                model: "session";
              }
            | {
                data: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  accountId: string;
                  createdAt: number;
                  idToken?: null | string;
                  password?: null | string;
                  providerId: string;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scope?: null | string;
                  updatedAt: number;
                  userId: string;
                };
                model: "account";
              }
            | {
                data: {
                  createdAt: number;
                  expiresAt: number;
                  identifier: string;
                  updatedAt: number;
                  value: string;
                };
                model: "verification";
              }
            | {
                data: { backupCodes: string; secret: string; userId: string };
                model: "twoFactor";
              }
            | {
                data: {
                  clientId?: null | string;
                  clientSecret?: null | string;
                  createdAt?: null | number;
                  disabled?: null | boolean;
                  icon?: null | string;
                  metadata?: null | string;
                  name?: null | string;
                  redirectUrls?: null | string;
                  type?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                model: "oauthApplication";
              }
            | {
                data: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  clientId?: null | string;
                  createdAt?: null | number;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                model: "oauthAccessToken";
              }
            | {
                data: {
                  clientId?: null | string;
                  consentGiven?: null | boolean;
                  createdAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                model: "oauthConsent";
              }
            | {
                data: {
                  createdAt: number;
                  expiresAt?: null | number;
                  privateKey: string;
                  publicKey: string;
                };
                model: "jwks";
              }
            | {
                data: { count: number; key: string; lastRequest: number };
                model: "rateLimit";
              };
          onCreateHandle?: string;
          select?: Array<string>;
        },
        any
      >;
      deleteMany: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "user";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "createdAt"
                    | "updatedAt"
                    | "twoFactorEnabled"
                    | "isAnonymous"
                    | "username"
                    | "displayUsername"
                    | "phoneNumber"
                    | "phoneNumberVerified"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "session";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "expiresAt"
                    | "token"
                    | "createdAt"
                    | "updatedAt"
                    | "ipAddress"
                    | "userAgent"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "account";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accountId"
                    | "providerId"
                    | "userId"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "password"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "verification";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "twoFactor";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "secret" | "backupCodes" | "userId" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthApplication";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "icon"
                    | "metadata"
                    | "clientId"
                    | "clientSecret"
                    | "redirectUrls"
                    | "type"
                    | "disabled"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthAccessToken";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accessToken"
                    | "refreshToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthConsent";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "consentGiven"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "jwks";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "publicKey"
                    | "privateKey"
                    | "createdAt"
                    | "expiresAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "rateLimit";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onDeleteHandle?: string;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        any
      >;
      deleteOne: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "user";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "createdAt"
                    | "updatedAt"
                    | "twoFactorEnabled"
                    | "isAnonymous"
                    | "username"
                    | "displayUsername"
                    | "phoneNumber"
                    | "phoneNumberVerified"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "session";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "expiresAt"
                    | "token"
                    | "createdAt"
                    | "updatedAt"
                    | "ipAddress"
                    | "userAgent"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "account";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accountId"
                    | "providerId"
                    | "userId"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "password"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "verification";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "twoFactor";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "secret" | "backupCodes" | "userId" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthApplication";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "icon"
                    | "metadata"
                    | "clientId"
                    | "clientSecret"
                    | "redirectUrls"
                    | "type"
                    | "disabled"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthAccessToken";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accessToken"
                    | "refreshToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthConsent";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "consentGiven"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "jwks";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "publicKey"
                    | "privateKey"
                    | "createdAt"
                    | "expiresAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "rateLimit";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onDeleteHandle?: string;
        },
        any
      >;
      findMany: FunctionReference<
        "query",
        "internal",
        {
          join?: any;
          limit?: number;
          model:
            | "user"
            | "session"
            | "account"
            | "verification"
            | "twoFactor"
            | "oauthApplication"
            | "oauthAccessToken"
            | "oauthConsent"
            | "jwks"
            | "rateLimit";
          offset?: number;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          select?: Array<string>;
          sortBy?: { direction: "asc" | "desc"; field: string };
          where?: Array<{
            connector?: "AND" | "OR";
            field: string;
            operator?:
              | "lt"
              | "lte"
              | "gt"
              | "gte"
              | "eq"
              | "in"
              | "not_in"
              | "ne"
              | "contains"
              | "starts_with"
              | "ends_with";
            value:
              | string
              | number
              | boolean
              | Array<string>
              | Array<number>
              | null;
          }>;
        },
        any
      >;
      findOne: FunctionReference<
        "query",
        "internal",
        {
          join?: any;
          model:
            | "user"
            | "session"
            | "account"
            | "verification"
            | "twoFactor"
            | "oauthApplication"
            | "oauthAccessToken"
            | "oauthConsent"
            | "jwks"
            | "rateLimit";
          select?: Array<string>;
          where?: Array<{
            connector?: "AND" | "OR";
            field: string;
            operator?:
              | "lt"
              | "lte"
              | "gt"
              | "gte"
              | "eq"
              | "in"
              | "not_in"
              | "ne"
              | "contains"
              | "starts_with"
              | "ends_with";
            value:
              | string
              | number
              | boolean
              | Array<string>
              | Array<number>
              | null;
          }>;
        },
        any
      >;
      updateMany: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "user";
                update: {
                  createdAt?: number;
                  displayUsername?: null | string;
                  email?: string;
                  emailVerified?: boolean;
                  image?: null | string;
                  isAnonymous?: null | boolean;
                  name?: string;
                  phoneNumber?: null | string;
                  phoneNumberVerified?: null | boolean;
                  twoFactorEnabled?: null | boolean;
                  updatedAt?: number;
                  userId?: null | string;
                  username?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "createdAt"
                    | "updatedAt"
                    | "twoFactorEnabled"
                    | "isAnonymous"
                    | "username"
                    | "displayUsername"
                    | "phoneNumber"
                    | "phoneNumberVerified"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "session";
                update: {
                  createdAt?: number;
                  expiresAt?: number;
                  ipAddress?: null | string;
                  token?: string;
                  updatedAt?: number;
                  userAgent?: null | string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "expiresAt"
                    | "token"
                    | "createdAt"
                    | "updatedAt"
                    | "ipAddress"
                    | "userAgent"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "account";
                update: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  accountId?: string;
                  createdAt?: number;
                  idToken?: null | string;
                  password?: null | string;
                  providerId?: string;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scope?: null | string;
                  updatedAt?: number;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accountId"
                    | "providerId"
                    | "userId"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "password"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "verification";
                update: {
                  createdAt?: number;
                  expiresAt?: number;
                  identifier?: string;
                  updatedAt?: number;
                  value?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "twoFactor";
                update: {
                  backupCodes?: string;
                  secret?: string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "secret" | "backupCodes" | "userId" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthApplication";
                update: {
                  clientId?: null | string;
                  clientSecret?: null | string;
                  createdAt?: null | number;
                  disabled?: null | boolean;
                  icon?: null | string;
                  metadata?: null | string;
                  name?: null | string;
                  redirectUrls?: null | string;
                  type?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "icon"
                    | "metadata"
                    | "clientId"
                    | "clientSecret"
                    | "redirectUrls"
                    | "type"
                    | "disabled"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthAccessToken";
                update: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  clientId?: null | string;
                  createdAt?: null | number;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accessToken"
                    | "refreshToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthConsent";
                update: {
                  clientId?: null | string;
                  consentGiven?: null | boolean;
                  createdAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "consentGiven"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "jwks";
                update: {
                  createdAt?: number;
                  expiresAt?: null | number;
                  privateKey?: string;
                  publicKey?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "publicKey"
                    | "privateKey"
                    | "createdAt"
                    | "expiresAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "rateLimit";
                update: { count?: number; key?: string; lastRequest?: number };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onUpdateHandle?: string;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        any
      >;
      updateOne: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "user";
                update: {
                  createdAt?: number;
                  displayUsername?: null | string;
                  email?: string;
                  emailVerified?: boolean;
                  image?: null | string;
                  isAnonymous?: null | boolean;
                  name?: string;
                  phoneNumber?: null | string;
                  phoneNumberVerified?: null | boolean;
                  twoFactorEnabled?: null | boolean;
                  updatedAt?: number;
                  userId?: null | string;
                  username?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "createdAt"
                    | "updatedAt"
                    | "twoFactorEnabled"
                    | "isAnonymous"
                    | "username"
                    | "displayUsername"
                    | "phoneNumber"
                    | "phoneNumberVerified"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "session";
                update: {
                  createdAt?: number;
                  expiresAt?: number;
                  ipAddress?: null | string;
                  token?: string;
                  updatedAt?: number;
                  userAgent?: null | string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "expiresAt"
                    | "token"
                    | "createdAt"
                    | "updatedAt"
                    | "ipAddress"
                    | "userAgent"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "account";
                update: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  accountId?: string;
                  createdAt?: number;
                  idToken?: null | string;
                  password?: null | string;
                  providerId?: string;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scope?: null | string;
                  updatedAt?: number;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accountId"
                    | "providerId"
                    | "userId"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "password"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "verification";
                update: {
                  createdAt?: number;
                  expiresAt?: number;
                  identifier?: string;
                  updatedAt?: number;
                  value?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "twoFactor";
                update: {
                  backupCodes?: string;
                  secret?: string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "secret" | "backupCodes" | "userId" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthApplication";
                update: {
                  clientId?: null | string;
                  clientSecret?: null | string;
                  createdAt?: null | number;
                  disabled?: null | boolean;
                  icon?: null | string;
                  metadata?: null | string;
                  name?: null | string;
                  redirectUrls?: null | string;
                  type?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "icon"
                    | "metadata"
                    | "clientId"
                    | "clientSecret"
                    | "redirectUrls"
                    | "type"
                    | "disabled"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthAccessToken";
                update: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  clientId?: null | string;
                  createdAt?: null | number;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accessToken"
                    | "refreshToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthConsent";
                update: {
                  clientId?: null | string;
                  consentGiven?: null | boolean;
                  createdAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "consentGiven"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "jwks";
                update: {
                  createdAt?: number;
                  expiresAt?: null | number;
                  privateKey?: string;
                  publicKey?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "publicKey"
                    | "privateKey"
                    | "createdAt"
                    | "expiresAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "rateLimit";
                update: { count?: number; key?: string; lastRequest?: number };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onUpdateHandle?: string;
        },
        any
      >;
    };
    adapterTest: {
      runTests: FunctionReference<"action", "internal", any, any>;
    };
    testProfiles: {
      adapterAdditionalFields: {
        create: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email: string;
                    emailVerified: boolean;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    ipAddress?: null | string;
                    token: string;
                    updatedAt: number;
                    userAgent?: null | string;
                    userId: string;
                  };
                  model: "session";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId: string;
                    createdAt: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt: number;
                    userId: string;
                  };
                  model: "account";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    identifier: string;
                    updatedAt: number;
                    value: string;
                  };
                  model: "verification";
                }
              | {
                  data: { backupCodes: string; secret: string; userId: string };
                  model: "twoFactor";
                }
              | {
                  data: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthApplication";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthAccessToken";
                }
              | {
                  data: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthConsent";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt?: null | number;
                    privateKey: string;
                    publicKey: string;
                  };
                  model: "jwks";
                }
              | {
                  data: { count: number; key: string; lastRequest: number };
                  model: "rateLimit";
                };
            onCreateHandle?: string;
            select?: Array<string>;
          },
          any
        >;
        deleteMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "customField"
                      | "numericField"
                      | "testField"
                      | "cbDefaultValueField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        deleteOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "customField"
                      | "numericField"
                      | "testField"
                      | "cbDefaultValueField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
          },
          any
        >;
        findMany: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            limit?: number;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit";
            offset?: number;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
            select?: Array<string>;
            sortBy?: { direction: "asc" | "desc"; field: string };
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        findOne: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit";
            select?: Array<string>;
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        updateMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: string;
                    emailVerified?: boolean;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "customField"
                      | "numericField"
                      | "testField"
                      | "cbDefaultValueField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        updateOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: string;
                    emailVerified?: boolean;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "customField"
                      | "numericField"
                      | "testField"
                      | "cbDefaultValueField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
          },
          any
        >;
      };
      adapterOrganizationJoins: {
        create: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    ipAddress?: null | string;
                    token: string;
                    updatedAt: number;
                    userAgent?: null | string;
                    userId: string;
                  };
                  model: "session";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId: string;
                    createdAt: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt: number;
                    userId: string;
                  };
                  model: "account";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    identifier: string;
                    updatedAt: number;
                    value: string;
                  };
                  model: "verification";
                }
              | {
                  data: { backupCodes: string; secret: string; userId: string };
                  model: "twoFactor";
                }
              | {
                  data: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthApplication";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthAccessToken";
                }
              | {
                  data: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthConsent";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt?: null | number;
                    privateKey: string;
                    publicKey: string;
                  };
                  model: "jwks";
                }
              | {
                  data: { count: number; key: string; lastRequest: number };
                  model: "rateLimit";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user_custom";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user_table";
                }
              | { data: { oneToOne: string }; model: "oneToOneTable" }
              | {
                  data: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  model: "one_to_one_table";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  model: "testModel";
                }
              | {
                  data: {
                    createdAt: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name: string;
                    slug: string;
                    updatedAt?: null | number;
                  };
                  model: "organization";
                }
              | {
                  data: {
                    createdAt: number;
                    organizationId: string;
                    role: string;
                    updatedAt?: null | number;
                    userId: string;
                  };
                  model: "member";
                }
              | {
                  data: {
                    createdAt: number;
                    name: string;
                    organizationId: string;
                    updatedAt?: null | number;
                  };
                  model: "team";
                }
              | {
                  data: {
                    createdAt?: null | number;
                    teamId: string;
                    userId: string;
                  };
                  model: "teamMember";
                }
              | {
                  data: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  model: "invitation";
                };
            onCreateHandle?: string;
            select?: Array<string>;
          },
          any
        >;
        deleteMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        deleteOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
          },
          any
        >;
        findMany: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            limit?: number;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit"
              | "user_custom"
              | "user_table"
              | "oneToOneTable"
              | "one_to_one_table"
              | "testModel"
              | "organization"
              | "member"
              | "team"
              | "teamMember"
              | "invitation";
            offset?: number;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
            select?: Array<string>;
            sortBy?: { direction: "asc" | "desc"; field: string };
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        findOne: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit"
              | "user_custom"
              | "user_table"
              | "oneToOneTable"
              | "one_to_one_table"
              | "testModel"
              | "organization"
              | "member"
              | "team"
              | "teamMember"
              | "invitation";
            select?: Array<string>;
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        updateMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  update: { oneToOne?: string };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  update: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  update: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  update: {
                    createdAt?: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name?: string;
                    slug?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  update: {
                    createdAt?: number;
                    organizationId?: string;
                    role?: string;
                    updatedAt?: null | number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  update: {
                    createdAt?: number;
                    name?: string;
                    organizationId?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  update: {
                    createdAt?: null | number;
                    teamId?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  update: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        updateOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  update: { oneToOne?: string };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  update: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  update: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  update: {
                    createdAt?: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name?: string;
                    slug?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  update: {
                    createdAt?: number;
                    organizationId?: string;
                    role?: string;
                    updatedAt?: null | number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  update: {
                    createdAt?: number;
                    name?: string;
                    organizationId?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  update: {
                    createdAt?: null | number;
                    teamId?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  update: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
          },
          any
        >;
      };
      adapterPluginTable: {
        create: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    ipAddress?: null | string;
                    token: string;
                    updatedAt: number;
                    userAgent?: null | string;
                    userId: string;
                  };
                  model: "session";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId: string;
                    createdAt: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt: number;
                    userId: string;
                  };
                  model: "account";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    identifier: string;
                    updatedAt: number;
                    value: string;
                  };
                  model: "verification";
                }
              | {
                  data: { backupCodes: string; secret: string; userId: string };
                  model: "twoFactor";
                }
              | {
                  data: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthApplication";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthAccessToken";
                }
              | {
                  data: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthConsent";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt?: null | number;
                    privateKey: string;
                    publicKey: string;
                  };
                  model: "jwks";
                }
              | {
                  data: { count: number; key: string; lastRequest: number };
                  model: "rateLimit";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user_custom";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user_table";
                }
              | { data: { oneToOne: string }; model: "oneToOneTable" }
              | {
                  data: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  model: "one_to_one_table";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  model: "testModel";
                }
              | {
                  data: {
                    createdAt: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name: string;
                    slug: string;
                    updatedAt?: null | number;
                  };
                  model: "organization";
                }
              | {
                  data: {
                    createdAt: number;
                    organizationId: string;
                    role: string;
                    updatedAt?: null | number;
                    userId: string;
                  };
                  model: "member";
                }
              | {
                  data: {
                    createdAt: number;
                    name: string;
                    organizationId: string;
                    updatedAt?: null | number;
                  };
                  model: "team";
                }
              | {
                  data: {
                    createdAt?: null | number;
                    teamId: string;
                    userId: string;
                  };
                  model: "teamMember";
                }
              | {
                  data: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  model: "invitation";
                };
            onCreateHandle?: string;
            select?: Array<string>;
          },
          any
        >;
        deleteMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        deleteOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
          },
          any
        >;
        findMany: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            limit?: number;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit"
              | "user_custom"
              | "user_table"
              | "oneToOneTable"
              | "one_to_one_table"
              | "testModel"
              | "organization"
              | "member"
              | "team"
              | "teamMember"
              | "invitation";
            offset?: number;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
            select?: Array<string>;
            sortBy?: { direction: "asc" | "desc"; field: string };
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        findOne: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit"
              | "user_custom"
              | "user_table"
              | "oneToOneTable"
              | "one_to_one_table"
              | "testModel"
              | "organization"
              | "member"
              | "team"
              | "teamMember"
              | "invitation";
            select?: Array<string>;
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        updateMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  update: { oneToOne?: string };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  update: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  update: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  update: {
                    createdAt?: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name?: string;
                    slug?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  update: {
                    createdAt?: number;
                    organizationId?: string;
                    role?: string;
                    updatedAt?: null | number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  update: {
                    createdAt?: number;
                    name?: string;
                    organizationId?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  update: {
                    createdAt?: null | number;
                    teamId?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  update: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        updateOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  update: { oneToOne?: string };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  update: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  update: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  update: {
                    createdAt?: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name?: string;
                    slug?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  update: {
                    createdAt?: number;
                    organizationId?: string;
                    role?: string;
                    updatedAt?: null | number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  update: {
                    createdAt?: number;
                    name?: string;
                    organizationId?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  update: {
                    createdAt?: null | number;
                    teamId?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  update: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
          },
          any
        >;
      };
      adapterRenameField: {
        create: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    ipAddress?: null | string;
                    token: string;
                    updatedAt: number;
                    userAgent?: null | string;
                    userId: string;
                  };
                  model: "session";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId: string;
                    createdAt: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt: number;
                    userId: string;
                  };
                  model: "account";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    identifier: string;
                    updatedAt: number;
                    value: string;
                  };
                  model: "verification";
                }
              | {
                  data: { backupCodes: string; secret: string; userId: string };
                  model: "twoFactor";
                }
              | {
                  data: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthApplication";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthAccessToken";
                }
              | {
                  data: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthConsent";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt?: null | number;
                    privateKey: string;
                    publicKey: string;
                  };
                  model: "jwks";
                }
              | {
                  data: { count: number; key: string; lastRequest: number };
                  model: "rateLimit";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user_custom";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user_table";
                }
              | { data: { oneToOne: string }; model: "oneToOneTable" }
              | {
                  data: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  model: "one_to_one_table";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  model: "testModel";
                }
              | {
                  data: {
                    createdAt: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name: string;
                    slug: string;
                    updatedAt?: null | number;
                  };
                  model: "organization";
                }
              | {
                  data: {
                    createdAt: number;
                    organizationId: string;
                    role: string;
                    updatedAt?: null | number;
                    userId: string;
                  };
                  model: "member";
                }
              | {
                  data: {
                    createdAt: number;
                    name: string;
                    organizationId: string;
                    updatedAt?: null | number;
                  };
                  model: "team";
                }
              | {
                  data: {
                    createdAt?: null | number;
                    teamId: string;
                    userId: string;
                  };
                  model: "teamMember";
                }
              | {
                  data: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  model: "invitation";
                };
            onCreateHandle?: string;
            select?: Array<string>;
          },
          any
        >;
        deleteMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        deleteOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
          },
          any
        >;
        findMany: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            limit?: number;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit"
              | "user_custom"
              | "user_table"
              | "oneToOneTable"
              | "one_to_one_table"
              | "testModel"
              | "organization"
              | "member"
              | "team"
              | "teamMember"
              | "invitation";
            offset?: number;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
            select?: Array<string>;
            sortBy?: { direction: "asc" | "desc"; field: string };
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        findOne: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit"
              | "user_custom"
              | "user_table"
              | "oneToOneTable"
              | "one_to_one_table"
              | "testModel"
              | "organization"
              | "member"
              | "team"
              | "teamMember"
              | "invitation";
            select?: Array<string>;
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        updateMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  update: { oneToOne?: string };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  update: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  update: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  update: {
                    createdAt?: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name?: string;
                    slug?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  update: {
                    createdAt?: number;
                    organizationId?: string;
                    role?: string;
                    updatedAt?: null | number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  update: {
                    createdAt?: number;
                    name?: string;
                    organizationId?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  update: {
                    createdAt?: null | number;
                    teamId?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  update: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        updateOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  update: { oneToOne?: string };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  update: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  update: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  update: {
                    createdAt?: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name?: string;
                    slug?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  update: {
                    createdAt?: number;
                    organizationId?: string;
                    role?: string;
                    updatedAt?: null | number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  update: {
                    createdAt?: number;
                    name?: string;
                    organizationId?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  update: {
                    createdAt?: null | number;
                    teamId?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  update: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
          },
          any
        >;
      };
      adapterRenameUserCustom: {
        create: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    ipAddress?: null | string;
                    token: string;
                    updatedAt: number;
                    userAgent?: null | string;
                    userId: string;
                  };
                  model: "session";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId: string;
                    createdAt: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt: number;
                    userId: string;
                  };
                  model: "account";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    identifier: string;
                    updatedAt: number;
                    value: string;
                  };
                  model: "verification";
                }
              | {
                  data: { backupCodes: string; secret: string; userId: string };
                  model: "twoFactor";
                }
              | {
                  data: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthApplication";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthAccessToken";
                }
              | {
                  data: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthConsent";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt?: null | number;
                    privateKey: string;
                    publicKey: string;
                  };
                  model: "jwks";
                }
              | {
                  data: { count: number; key: string; lastRequest: number };
                  model: "rateLimit";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user_custom";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user_table";
                }
              | { data: { oneToOne: string }; model: "oneToOneTable" }
              | {
                  data: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  model: "one_to_one_table";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  model: "testModel";
                }
              | {
                  data: {
                    createdAt: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name: string;
                    slug: string;
                    updatedAt?: null | number;
                  };
                  model: "organization";
                }
              | {
                  data: {
                    createdAt: number;
                    organizationId: string;
                    role: string;
                    updatedAt?: null | number;
                    userId: string;
                  };
                  model: "member";
                }
              | {
                  data: {
                    createdAt: number;
                    name: string;
                    organizationId: string;
                    updatedAt?: null | number;
                  };
                  model: "team";
                }
              | {
                  data: {
                    createdAt?: null | number;
                    teamId: string;
                    userId: string;
                  };
                  model: "teamMember";
                }
              | {
                  data: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  model: "invitation";
                };
            onCreateHandle?: string;
            select?: Array<string>;
          },
          any
        >;
        deleteMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        deleteOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
          },
          any
        >;
        findMany: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            limit?: number;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit"
              | "user_custom"
              | "user_table"
              | "oneToOneTable"
              | "one_to_one_table"
              | "testModel"
              | "organization"
              | "member"
              | "team"
              | "teamMember"
              | "invitation";
            offset?: number;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
            select?: Array<string>;
            sortBy?: { direction: "asc" | "desc"; field: string };
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        findOne: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit"
              | "user_custom"
              | "user_table"
              | "oneToOneTable"
              | "one_to_one_table"
              | "testModel"
              | "organization"
              | "member"
              | "team"
              | "teamMember"
              | "invitation";
            select?: Array<string>;
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        updateMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  update: { oneToOne?: string };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  update: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  update: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  update: {
                    createdAt?: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name?: string;
                    slug?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  update: {
                    createdAt?: number;
                    organizationId?: string;
                    role?: string;
                    updatedAt?: null | number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  update: {
                    createdAt?: number;
                    name?: string;
                    organizationId?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  update: {
                    createdAt?: null | number;
                    teamId?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  update: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        updateOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  update: { oneToOne?: string };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  update: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  update: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  update: {
                    createdAt?: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name?: string;
                    slug?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  update: {
                    createdAt?: number;
                    organizationId?: string;
                    role?: string;
                    updatedAt?: null | number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  update: {
                    createdAt?: number;
                    name?: string;
                    organizationId?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  update: {
                    createdAt?: null | number;
                    teamId?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  update: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
          },
          any
        >;
      };
      adapterRenameUserTable: {
        create: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    ipAddress?: null | string;
                    token: string;
                    updatedAt: number;
                    userAgent?: null | string;
                    userId: string;
                  };
                  model: "session";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId: string;
                    createdAt: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt: number;
                    userId: string;
                  };
                  model: "account";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    identifier: string;
                    updatedAt: number;
                    value: string;
                  };
                  model: "verification";
                }
              | {
                  data: { backupCodes: string; secret: string; userId: string };
                  model: "twoFactor";
                }
              | {
                  data: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthApplication";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthAccessToken";
                }
              | {
                  data: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthConsent";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt?: null | number;
                    privateKey: string;
                    publicKey: string;
                  };
                  model: "jwks";
                }
              | {
                  data: { count: number; key: string; lastRequest: number };
                  model: "rateLimit";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user_custom";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user_table";
                }
              | { data: { oneToOne: string }; model: "oneToOneTable" }
              | {
                  data: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  model: "one_to_one_table";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  model: "testModel";
                }
              | {
                  data: {
                    createdAt: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name: string;
                    slug: string;
                    updatedAt?: null | number;
                  };
                  model: "organization";
                }
              | {
                  data: {
                    createdAt: number;
                    organizationId: string;
                    role: string;
                    updatedAt?: null | number;
                    userId: string;
                  };
                  model: "member";
                }
              | {
                  data: {
                    createdAt: number;
                    name: string;
                    organizationId: string;
                    updatedAt?: null | number;
                  };
                  model: "team";
                }
              | {
                  data: {
                    createdAt?: null | number;
                    teamId: string;
                    userId: string;
                  };
                  model: "teamMember";
                }
              | {
                  data: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  model: "invitation";
                };
            onCreateHandle?: string;
            select?: Array<string>;
          },
          any
        >;
        deleteMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        deleteOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
          },
          any
        >;
        findMany: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            limit?: number;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit"
              | "user_custom"
              | "user_table"
              | "oneToOneTable"
              | "one_to_one_table"
              | "testModel"
              | "organization"
              | "member"
              | "team"
              | "teamMember"
              | "invitation";
            offset?: number;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
            select?: Array<string>;
            sortBy?: { direction: "asc" | "desc"; field: string };
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        findOne: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit"
              | "user_custom"
              | "user_table"
              | "oneToOneTable"
              | "one_to_one_table"
              | "testModel"
              | "organization"
              | "member"
              | "team"
              | "teamMember"
              | "invitation";
            select?: Array<string>;
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        updateMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  update: { oneToOne?: string };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  update: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  update: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  update: {
                    createdAt?: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name?: string;
                    slug?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  update: {
                    createdAt?: number;
                    organizationId?: string;
                    role?: string;
                    updatedAt?: null | number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  update: {
                    createdAt?: number;
                    name?: string;
                    organizationId?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  update: {
                    createdAt?: null | number;
                    teamId?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  update: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        updateOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  update: { oneToOne?: string };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  update: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  update: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  update: {
                    createdAt?: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name?: string;
                    slug?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  update: {
                    createdAt?: number;
                    organizationId?: string;
                    role?: string;
                    updatedAt?: null | number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  update: {
                    createdAt?: number;
                    name?: string;
                    organizationId?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  update: {
                    createdAt?: null | number;
                    teamId?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  update: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
          },
          any
        >;
      };
    };
  };
  lastfm: {
    artists: {
      artistDetails: FunctionReference<
        "action",
        "internal",
        {
          apiKey: string;
          artistName: string | null;
          musicBrainzId: string | null;
        },
        {
          artistName: string;
          bio: { published: string | null; summary: string | null };
          lastFmUrl: string | null;
          musicBrainzId: string | null;
          resolvedVia: "musicbrainz_id" | "artist_name";
          similarArtists: Array<{
            musicBrainzId: string | null;
            name: string;
            url: string | null;
          }>;
          stats: { listeners: number | null; playcount: number | null };
          topTags: Array<{ name: string; url: string | null }>;
        } | null
      >;
    };
    scheduler: {
      reserve: FunctionReference<
        "mutation",
        "internal",
        { intervalMs: number; key: string },
        number
      >;
    };
  };
  musicbrainz: {
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
        } | null
      >;
      spotifyArtistIdByMusicBrainzId: FunctionReference<
        "action",
        "internal",
        { musicBrainzArtistId: string },
        string | null
      >;
    };
    scheduler: {
      reserve: FunctionReference<
        "mutation",
        "internal",
        { intervalMs: number; key: string },
        number
      >;
    };
  };
  spotify: {
    albums: {
      albumTracks: FunctionReference<
        "action",
        "internal",
        { accessToken: string; albumId: string },
        Array<{
          albumImage: string | null;
          albumName: string;
          artist: string;
          durationMs: number;
          id: string;
          name: string;
        }>
      >;
    };
    artists: {
      artistPage: FunctionReference<
        "action",
        "internal",
        { accessToken: string; artistId: string; cacheScope?: string },
        {
          albums: Array<{
            albumType: string | null;
            id: string;
            image: string | null;
            name: string;
            releaseDate: string | null;
            totalTracks: number;
          }>;
          artist: {
            followerCount: number;
            genres: Array<string>;
            id: string;
            image: string | null;
            name: string;
          };
          singles: Array<{
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
            durationMs: number;
            id: string;
            name: string;
          }>;
        } | null
      >;
      favoriteArtists: FunctionReference<
        "action",
        "internal",
        {
          accessToken: string;
          cacheScope?: string;
          forceRefresh?: boolean;
          limit?: number;
        },
        Array<{
          followerCount: number;
          genres: Array<string>;
          id: string;
          image: string | null;
          name: string;
        }>
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
        }>
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
          retryAfterSeconds?: number;
          status: number;
        }
      >;
      pause: FunctionReference<
        "action",
        "internal",
        { accessToken: string },
        { ok: boolean; retryAfterSeconds?: number; status: number }
      >;
      play: FunctionReference<
        "action",
        "internal",
        {
          accessToken: string;
          deviceId?: string;
          offsetMs?: number;
          uri: string;
        },
        { ok: boolean; retryAfterSeconds?: number; status: number }
      >;
      resume: FunctionReference<
        "action",
        "internal",
        { accessToken: string },
        { ok: boolean; retryAfterSeconds?: number; status: number }
      >;
      setRepeat: FunctionReference<
        "action",
        "internal",
        {
          accessToken: string;
          deviceId?: string;
          state: "track" | "context" | "off";
        },
        { ok: boolean; retryAfterSeconds?: number; status: number }
      >;
      setVolume: FunctionReference<
        "action",
        "internal",
        { accessToken: string; percent: number },
        { ok: boolean; retryAfterSeconds?: number; status: number }
      >;
    };
    playlists: {
      playlistsPage: FunctionReference<
        "action",
        "internal",
        {
          accessToken: string;
          cacheScope?: string;
          forceRefresh?: boolean;
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
        }
      >;
      playlistTracks: FunctionReference<
        "action",
        "internal",
        { accessToken: string; cacheScope?: string; playlistId: string },
        Array<{
          albumImage: string | null;
          albumName: string;
          artist: string;
          durationMs: number;
          id: string;
          name: string;
        }>
      >;
    };
    search: {
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
            durationMs: number;
            id: string;
            name: string;
          }>;
        }
      >;
      searchTracks: FunctionReference<
        "action",
        "internal",
        { accessToken: string; query: string },
        Array<{
          albumImage: string | null;
          albumName: string;
          artist: string;
          durationMs: number;
          id: string;
          name: string;
        }>
      >;
    };
    tracks: {
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
              durationMs: number;
              id: string;
              name: string;
            };
          }>;
          rateLimited: boolean;
        }
      >;
    };
  };
};
