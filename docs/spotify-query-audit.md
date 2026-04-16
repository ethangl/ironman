# Spotify Query Audit

## Scope

This document captures the current Spotify API read/query surface in the app, with emphasis on:

- which endpoints are actually hot
- which paths are cached vs polled
- which queries are most likely to trigger rate-limit or correctness problems
- what the most defensible next fixes are

Boundary assumptions:

- frontend owns UI state
- `convex/spotify.ts` owns auth handoff
- `convex/components/spotify/*` owns Spotify request policy
- browser-side Spotify tokens only exist for the Web Playback SDK and playback actions that require them

## Current request policy

Shared Spotify fetch behavior lives in [convex/components/spotify/client.ts](../convex/components/spotify/client.ts):

- `spotifyFetch()` is the low-level fetch wrapper for Spotify Web API requests
- identical in-flight `GET` requests are deduped per `method + path + token`
- `429` responses create an in-memory cooldown keyed by `method + path + token`
- `spotifyFetchOptional()` converts failures into fallback values and logs a warning

App-level caching lives in the `spotifyCache` table via:

- [convex/components/spotify/cacheHelpers.ts](../convex/components/spotify/cacheHelpers.ts)
- [convex/components/spotify/cache.ts](../convex/components/spotify/cache.ts)

This is the durable cache layer. It is what matters for avoiding repeat queries across requests.

## Endpoint inventory

### Search component

Defined in [convex/components/spotify/searchApi.ts](../convex/components/spotify/searchApi.ts).

- `GET /search?q=...&type=track&limit=10`
  - used by `searchTracks()`
- `GET /search?q=...&type=track,artist,playlist&limit=6`
  - used by `searchSpotify()`
- `GET /me`
  - used by `getSpotifyProfileMarket()`
- `GET /albums/:id`
  - used by `getAlbumTracks()`
- `GET /artists/:id`
  - used by `getArtistPageData()`
- `GET /artists/:id/albums?include_groups=album&limit=10`
  - used by `getArtistPageData()` for albums
- `GET /artists/:id/albums?include_groups=single&limit=10`
  - used by `getArtistPageData()` for singles
- `GET /search?q=artist:...&type=track&limit=10`
  - used by `getArtistPageData()` to derive top tracks via exact artist-id filtering, primary-artist preference, and popularity sort

### Activity component

Defined in [convex/components/spotify/activityApi.ts](../convex/components/spotify/activityApi.ts).

- `GET /me/player/recently-played?limit=50`
- `GET /me/player/recently-played?limit=30`
  - used by `getRecentlyPlayed()`
- `GET /me/playlists?limit=50&offset=:offset`
  - used by `getUserPlaylists()`
- `GET /playlists/:id/items?limit=100`
  - used by `getPlaylistTracks()`
- `GET /me/top/artists?limit=:limit`
  - used by `getTopArtists()`
- `GET /me/following?type=artist&limit=50`
  - used by `getFavoriteArtists()`

### Playback component

Defined in [convex/components/spotify/playbackApi.ts](../convex/components/spotify/playbackApi.ts).

- `GET /me/player/currently-playing`
- `PUT /me/player/play`
- `PUT /me/player/pause`
- `PUT /me/player/volume`
- `PUT /me/player/repeat`

These matter operationally, but the current audit is mostly about troublesome read/query paths.

### Better Auth callback

Defined in [convex/betterAuth.ts](../convex/betterAuth.ts).

- `GET /v1/me`
  - used during Spotify OAuth callback to fetch provider profile data

This is outside normal app browsing, but still a critical Spotify request path because rate-limiting here blocks reconnect/link flows.

## Hot paths

### Home page activity bootstrap

The home page loads activity via [src/features/spotify/activity/spotify-activity-provider.tsx](../src/features/spotify/activity/spotify-activity-provider.tsx).

Initial load:

- `client.spotifyActivity.getRecentlyPlayed()`

That means a hard refresh of the home page can hit:

- `/me/player/recently-played`

depending on cache state.

Playlists are no longer part of startup:

- page 0 is hydrated from durable cache only on startup
- Spotify is queried only when the user explicitly clicks `Load` or `Refresh`

### Local recent-track maintenance

After the initial seed load, recent tracks are maintained locally in:

- [src/features/spotify/activity/spotify-activity-provider.tsx](../src/features/spotify/activity/spotify-activity-provider.tsx)
- [src/features/spotify/player/web-player-provider.tsx](../src/features/spotify/player/web-player-provider.tsx)

Behavior:

- Spotify is queried once on initial load via `recentlyPlayed`
- subsequent recent entries are appended locally on confirmed SDK track transitions
- there is no background polling anymore

This means `GET /me/player/recently-played?limit=30` is now a startup/manual-refresh query, not a steady-state poll query.

### Artist page load

The artist page loads through:

- [src/features/artist/use-artist-page-data.ts](../src/features/artist/use-artist-page-data.ts)

That calls:

- `client.artists.getPageData(artistId)`
- which calls `api.spotify.artistPage`
- which calls `components.spotify.search.artistPage`

Underlying Spotify reads:

- `GET /artists/:id`
- `GET /artists/:id/albums?include_groups=album&limit=10`
- `GET /artists/:id/albums?include_groups=single&limit=10`
- `GET /search?q=artist:...&type=track&limit=10`
- sometimes `GET /me` first to determine market if market cache is cold

### Search

Search is driven by:

- [src/features/search/search-provider.tsx](../src/features/search/search-provider.tsx)

Behavior:

- 300ms debounce
- query executes only when trimmed input matches the debounced value

Underlying Spotify reads:

- `GET /search?q=...&type=track,artist,playlist&limit=6`

This path is relatively well-contained.

## Ranking: most troublesome queries

### 1. `/me/player/recently-played?limit=30`

Source:

- [convex/components/spotify/activityApi.ts](../convex/components/spotify/activityApi.ts)

Why it is troublesome:

- it is still on the home startup path
- it is personal and relatively live
- manual refreshes still re-hit Spotify

Current mitigation:

- no background polling
- recents are seeded once, then maintained locally on confirmed track transitions
- 30-second durable cache in [convex/components/spotify/activity.ts](../convex/components/spotify/activity.ts)
- `rateLimited` fallback shape when Spotify returns `429`

Assessment:

- no longer the hottest steady-state query
- now mainly a startup and manual-resync query

### 2. `/me/following?type=artist&limit=50`

Source:

- [convex/components/spotify/activityApi.ts](../convex/components/spotify/activityApi.ts)

Why it is still worth watching:

- it is user-scoped and rate-sensitive
- but it is no longer part of startup
- it now only runs when the user explicitly loads or refreshes favorite artists

Current mitigation:

- favorite artists are hydrated from durable cache only on startup
- explicit `Load` / `Refresh` is the only path that re-queries Spotify
- cached fallback is preferred if a forced refresh fails

Assessment:

- no longer a startup liability
- now an explicit, user-triggered query

### 3. `/me/playlists?limit=50&offset=0`

Source:

- [convex/components/spotify/activityApi.ts](../convex/components/spotify/activityApi.ts)

Why it is still worth watching:

- it is user library membership, not especially live state
- page 0 can still hit Spotify if the user explicitly loads or refreshes playlists
- later pages remain lazy and user-triggered

Current mitigation:

- playlists are hydrated from durable cache only on startup
- explicit `Load` / `Refresh` is the only path that re-queries Spotify for page 0
- cached fallback is preferred if a forced refresh fails
- 5-minute durable cache in [convex/components/spotify/activity.ts](../convex/components/spotify/activity.ts)

Assessment:

- no longer a startup liability
- now an explicit, user-triggered query

### 4. Artist-page top tracks via `/search?q=artist:...&type=track&limit=10`

Source:

- [convex/components/spotify/searchApi.ts](../convex/components/spotify/searchApi.ts)

Why it is troublesome:

- it is heuristic, not canonical
- it depends on artist name search quality
- there is no Web API replacement for the removed `/artists/{id}/top-tracks` endpoint
- even with exact artist-id filtering and popularity sorting, relevance is still derived from search

Assessment:

- moderate request-risk
- still a correctness heuristic, but less failure-prone than before

### 5. Artist releases via `/artists/:id/albums?...include_groups=album|single`

Source:

- [convex/components/spotify/searchApi.ts](../convex/components/spotify/searchApi.ts)

Why it is troublesome:

- there are now two release queries per artist page
- release failures return a partial page without caching it
- the UI can still show an empty albums or singles section for that request

Assessment:

- moderate correctness risk, reduced from the previous cache-poisoning behavior

### 6. `/albums/:id` and `/playlists/:id/items?limit=100`

Sources:

- [convex/components/spotify/searchApi.ts](../convex/components/spotify/searchApi.ts)
- [convex/components/spotify/activityApi.ts](../convex/components/spotify/activityApi.ts)

Why they are troublesome:

- neither path paginates
- large albums/playlists can be truncated

Assessment:

- more of a completeness bug than a rate-limit problem

### 7. Better Auth callback `/v1/me`

Source:

- [convex/betterAuth.ts](../convex/betterAuth.ts)

Why it is troublesome:

- if Spotify rate-limits this request, reconnect/link fails entirely
- this was the direct cause of the recent reconnect failures

Current mitigation:

- callback now fails fast on `429`
- retry window is persisted and surfaced to the reconnect UI

Assessment:

- not hot during normal usage
- high impact when it fails

## Current cache and fallback behavior

### Durable cache TTLs

Defined in component actions.

Search:

- search results: 5 minutes
- search tracks: 5 minutes
- artist page: 30 minutes
- album tracks: effectively permanent (10 years)
- Spotify profile market: 30 minutes

Activity:

- recently played: 30 seconds
- playlists page: 5 minutes
- playlist tracks: 10 minutes
- favorite artists: 15 minutes
- top artists: 15 minutes

### Important fallback behavior

- `recentlyPlayed` returns `{ items: [], rateLimited: true }` on `429`
- `playlistsPage` falls back to `{ items: [], total: 0 }` on failure
- `favoriteArtists` falls back to `[]` on failure
- artist page albums and singles can still become empty sections on transient failure
- artist page top tracks now fail explicitly instead of silently becoming `[]`

This means some rate limits are surfaced explicitly, but others are silently converted into “no data”.

## Known correctness risks

### Artist page albums/singles fallback

Current behavior:

- artist page albums or singles can fall back to an empty array
- the resulting partial page is no longer cached

Effect:

- temporary Spotify errors still degrade the current response, but they no longer create long-lived bad artist pages

### Truncated playlist and album tracks

Current behavior:

- playlist tracks stop at 100 items
- album tracks depend on `/albums/:id` embedded track payload and do not paginate

Effect:

- large playlists or long releases may not fully play/load

### Silent degradation of favorite artists and playlists page

Current behavior:

- explicit favorite-artist refresh falls back to cached data if available, otherwise `[]`
- playlists page failure becomes `{ items: [], total: 0 }`

Effect:

- the UI can look empty even when the issue is upstream rate limiting or API failure

## Agreed direction

This is the current preferred product/query model for personal Spotify data in the app.

### Recently played

Treat this as:

- seeded once from Spotify on initial app load
- then maintained locally by the app

Policy:

- load `recentlyPlayed` once on initial activity load
- background polling is removed
- append new entries on confirmed track transition in our player
- keep an explicit refresh action for manual resync

Why:

- it removes the hottest steady-state Spotify query
- it matches the app's actual usage better than trying to mirror Spotify in real time
- it keeps the "recently played" surface responsive without recurring API traffic

Important semantic note:

- this becomes "recently played in this app, seeded from Spotify once", not a continuously synchronized Spotify history mirror

### Favorite artists and playlists

Treat these as:

- hard-cached personal library data
- refreshed only on explicit user action

Policy:

- fetch once if cache is missing
- read from durable cache afterward
- re-query only when the user explicitly refreshes

Why:

- these are not live enough to justify background reads
- they are part of the user's library/profile shape, not transient playback state
- this dramatically simplifies request behavior and expectations

Important distinction:

- `GET /me/playlists` is the user's playlist/library list, so it is user-scoped
- `GET /playlists/:id/items` is the underlying playlist resource, which is generally cacheable by playlist id

That means:

- playlist membership in "my library" should be cached per user
- playlist contents can usually be cached per playlist id
- private playlist visibility is the caveat; if access differs by user, cache policy may need to stay user-scoped for those cases

### Playlist tracks

Treat these as:

- lazily loaded on demand
- hard-cached after fetch

Policy:

- fetch when a playlist is opened or played
- retain the result in durable cache
- only re-query on explicit refresh or cache invalidation

### Summary policy

- `recently played`: query once, then update locally from confirmed playback transitions
- `favorite artists`: hard cache per user, refresh on demand
- `my playlists list`: hard cache per user, refresh on demand
- `album tracks`: lazy fetch, hard cache by album id
- `playlist tracks`: lazy fetch, hard cache by playlist id where visibility allows

## Recommended next fixes

### 1. Paginate playlist and album tracks

Recommendation:

- paginate `/playlists/:id/items`
- paginate album tracks if needed instead of assuming the embedded payload is complete

Why this matters:

- current behavior can silently truncate data

### 2. Revisit artist-page releases fallback

Recommendation:

- decide whether empty albums/singles on transient failure is acceptable
- if not, surface the failure more explicitly instead of rendering an empty section

Why this matters:

- the cache-poisoning bug is fixed, but the current request can still degrade silently

## Practical debugging checklist

When investigating Spotify query problems, check in this order:

1. Which endpoint is actually failing?
   - inspect Convex logs from [convex/components/spotify/client.ts](../convex/components/spotify/client.ts)
2. Is the query on a startup path or a poll path?
   - home recent-tracks seed, explicit favorite-artists load, explicit playlists load, local recents append, artist load, search typing, reconnect callback
3. Is failure explicit or silently degraded?
   - `rateLimited` flag vs empty array fallback
4. Is the bad result durable?
   - check whether the component action cached the fallback value in `spotifyCache`
5. Is this a query problem or an auth callback problem?
   - reconnect uses [convex/betterAuth.ts](../convex/betterAuth.ts), not the normal component action flow

## Summary

If one query needs the most attention, it is:

- `GET /me/player/recently-played?limit=30`

If one correctness bug needs the most attention, it is:

- truncated playlist and album track loading

If one startup dependency should be questioned, it is:

- `GET /me/player/recently-played?limit=30`

## Cache-scoping rule of thumb

Use this when deciding whether a Spotify response should be cached by user or by resource:

- `/me/*` endpoints are user-scoped
- library membership is user-scoped, even when the underlying resource is public
- catalog/resource reads can usually be keyed by resource id
- market-sensitive catalog reads should be keyed by resource id plus market

Examples:

- `/albums/:id`: resource-scoped by album id
- `/playlists/:id/items`: usually resource-scoped by playlist id
- private-resource visibility can force a resource read back into user-scoped caching

Examples:

- `/me/player/recently-played`: user-scoped
- `/me/following?type=artist`: user-scoped
- `/me/playlists`: user-scoped
- `/playlists/:id/items`: usually resource-scoped by playlist id
- `/albums/:id`: usually resource-scoped by album id
- `/artists/:id` page data: resource-scoped, but market may need to be part of the key
