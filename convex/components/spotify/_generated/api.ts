/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activity from "../activity.js";
import type * as activityApi from "../activityApi.js";
import type * as client from "../client.js";
import type * as errors from "../errors.js";
import type * as mappers from "../mappers.js";
import type * as playback from "../playback.js";
import type * as playbackApi from "../playbackApi.js";
import type * as search from "../search.js";
import type * as searchApi from "../searchApi.js";
import type * as types from "../types.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import { anyApi, componentsGeneric } from "convex/server";

const fullApi: ApiFromModules<{
  activity: typeof activity;
  activityApi: typeof activityApi;
  client: typeof client;
  errors: typeof errors;
  mappers: typeof mappers;
  playback: typeof playback;
  playbackApi: typeof playbackApi;
  search: typeof search;
  searchApi: typeof searchApi;
  types: typeof types;
  validators: typeof validators;
}> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
> = anyApi as any;

export const components = componentsGeneric() as unknown as {};
