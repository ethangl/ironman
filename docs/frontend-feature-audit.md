# Frontend Feature Audit

Started: 2026-04-12

## Goal

Audit the frontend feature-by-feature and file-by-file with a simple question:

> Is this the right amount of complexity for the feature's actual intent?

The point is not to remove every abstraction. The point is to spot code that is carrying more machinery than the product needs.

## Rubric

- `Right-sized`: complexity matches the feature and its failure modes.
- `Borderline`: a little more structure than strictly necessary, but still earning its keep.
- `Overbuilt`: more indirection, caching, state, or abstraction than the feature seems to justify.

## Current Pass

| Feature            | Verdict       | Notes                                                                                                      |
| ------------------ | ------------- | ---------------------------------------------------------------------------------------------------------- |
| `spotify/activity` | `Right-sized` | Much simpler after deleting bootstrap.                                                                     |
| `spotify/client`   | `Borderline`  | Thin wrappers are still acceptable, but this is the first place I would collapse if we want less ceremony. |
| `ironman`          | `Right-sized` | Complex, but the product intent is complex too.                                                            |
| `search`           | `Right-sized` | Debounce + in-memory cache still look justified.                                                           |
| `artist`           | `Right-sized` | Plain fetch/state hook after cache removal.                                                                |
| `home`             | `Right-sized` | Mostly small presentational pieces plus one query hook.                                                    |
| `profile`          | `Right-sized` | Query hooks are thin; view complexity matches the page.                                                    |
| `song`             | `Right-sized` | Minimal wrapper over a single query.                                                                       |
| `live`             | `Right-sized` | About as simple as it can be.                                                                              |
| `auth`             | `Borderline`  | Login flow is intentionally careful, but cooldown persistence adds some ceremony.                          |
| `app`              | `Right-sized` | Much better after the recent runtime split.                                                                |

## Findings

### `src/features/spotify/activity`

**Verdict:** `Right-sized`

Why it feels okay now:

- The biggest over-engineered piece was the old bootstrap/cache layer, and that is already gone.
- The provider in [src/features/spotify/activity/spotify-activity-provider.tsx](/Users/ethan/w/ironman/src/features/spotify/activity/spotify-activity-provider.tsx) is doing one reasonable job: initial load plus a little incremental behavior.
- The remaining extra behavior is pretty local and easy to explain:
  - [use-spotify-recent-polling.ts](/Users/ethan/w/ironman/src/features/spotify/activity/use-spotify-recent-polling.ts) keeps recent tracks fresh.
  - [use-spotify-playlist-tracks.ts](/Users/ethan/w/ironman/src/features/spotify/activity/use-spotify-playlist-tracks.ts) caches playlist-track expansion in memory.

What still stands out:

- `requestIdRef` and `offsetRef` in the provider are slightly imperative for a feature this small.
- `offsetRef` could probably become `playlists.length` instead of separate mutable state.
- If we ever simplify further, the provider is the place to do it. The supporting hooks are already small.

Recommendation:

- Leave this feature alone for now.
- If we revisit it, start by removing `offsetRef`, not by inventing another abstraction.

### `src/features/spotify/client`

**Verdict:** `Borderline`

Why it mostly works:

- This folder centralizes Convex auth and Spotify-facing actions in one place.
- The client boundary is easy to mock in tests and easy to pass through context.
- The separation between `client`, `sdk`, and `player` now reads clearly.

Why it still feels a little ceremonious:

- Several files are extremely thin wrappers:
  - [artists-client.ts](/Users/ethan/w/ironman/src/features/spotify/client/artists-client.ts)
  - [search-client.ts](/Users/ethan/w/ironman/src/features/spotify/client/search-client.ts)
  - [spotify-activity-client.ts](/Users/ethan/w/ironman/src/features/spotify/client/spotify-activity-client.ts)
- The `SpotifyClient` container in [spotify-client.ts](/Users/ethan/w/ironman/src/features/spotify/client/spotify-client.ts) is now mostly an aggregation convenience, not a substantial abstraction.
- [search-client.ts](/Users/ethan/w/ironman/src/features/spotify/client/search-client.ts) has a duplicated aborted-signal check back-to-back, which is a small sign that this layer wants a tiny cleanup pass.

Recommendation:

- Keep it as-is for now.
- If we want one more simplification pass later, this is the first folder I would flatten.
- The likely end state would be fewer named client interfaces and more plain exported functions around the authenticated Convex client.

### `src/features/ironman`

**Verdict:** `Right-sized`

Why the complexity feels justified:

- This feature really does have unusual product requirements:
  - multi-tab coordination
  - time-based enforcement
  - wrong-song correction
  - streak mutation flows
- After the recent refactors, the complexity is at least divided along understandable seams:
  - [enforcement-engine.tsx](/Users/ethan/w/ironman/src/features/ironman/enforcement-engine.tsx)
  - [use-enforcement-leader.ts](/Users/ethan/w/ironman/src/features/ironman/use-enforcement-leader.ts)
  - [use-wrong-song-enforcement.ts](/Users/ethan/w/ironman/src/features/ironman/use-wrong-song-enforcement.ts)
  - [use-ironman-player-actions.ts](/Users/ethan/w/ironman/src/features/ironman/use-ironman-player-actions.ts)

What still looks a little rough, but not urgent:

- [ironman-client.ts](/Users/ethan/w/ironman/src/features/ironman/ironman-client.ts) exports the `IronmanClient` contract directly from the implementation file. That is workable, but a dedicated `contracts.ts` or `types.ts` would read cleaner.
- `WeaknessEvent` is only barely public. It is exported through the barrel, but it does not look like a strong shared domain contract yet.
- Logging is a little mixed between helper-based logging and a few direct `console.log` calls.

Recommendation:

- Do not simplify this feature just for the sake of simplicity.
- If we touch it again, prefer tiny contract/logging cleanup over structural rewrites.

### `src/features/search`

**Verdict:** `Right-sized`

Why it seems proportionate:

- The feature has one provider, one input, and one results component.
- The provider in [search-provider.tsx](/Users/ethan/w/ironman/src/features/search/search-provider.tsx) does a very understandable amount of work:
  - debounced input
  - abortable requests
  - small in-memory result cache
- The in-memory cache looks like a real UX optimization, not duplicated infrastructure.

What to watch:

- [search-results.tsx](/Users/ethan/w/ironman/src/features/search/search-results.tsx) owns a local playlist-track cache for playlist playback. That is reasonable, but it means the results component is doing some fetch orchestration, not just rendering.

Recommendation:

- Keep the current shape.
- If we ever split it more, do it only if playlist playback inside search gets more involved.

### `src/features/artist`

**Verdict:** `Right-sized`

Why it looks good:

- [use-artist-page-data.ts](/Users/ethan/w/ironman/src/features/artist/use-artist-page-data.ts) is now just a plain fetch/state hook with refresh behavior.
- After removing the client-side cache layer, the file reads proportionately to the page.

What still stands out:

- There is a small amount of duplicated loading/refreshing/error state shape here that also exists in a few other feature hooks.
- That is not a problem right now; it is the acceptable kind of duplication.

Recommendation:

- Leave it alone.

### `src/features/home`

**Verdict:** `Right-sized`

Why it looks good:

- The data hook in [use-home-leaderboards-data.ts](/Users/ethan/w/ironman/src/features/home/use-home-leaderboards-data.ts) is very small.
- The rest of the feature is mostly view composition and presentational board components.

Recommendation:

- No simplification work needed here right now.

### `src/features/profile`

**Verdict:** `Right-sized`

Why it looks good:

- [use-profile-data.ts](/Users/ethan/w/ironman/src/features/profile/use-profile-data.ts) is a thin query wrapper.
- [profile-content.tsx](/Users/ethan/w/ironman/src/features/profile/profile-content.tsx) is a big view, but it is straightforward UI complexity, not abstraction complexity.

Recommendation:

- Leave this feature alone unless the profile page itself gets more interactive.

### `src/features/song`

**Verdict:** `Right-sized`

Why it looks good:

- [use-song-stats.ts](/Users/ethan/w/ironman/src/features/song/use-song-stats.ts) is almost the minimum possible shape for this feature.

Recommendation:

- No action.

### `src/features/live`

**Verdict:** `Right-sized`

Why it looks good:

- [use-live-feed.ts](/Users/ethan/w/ironman/src/features/live/use-live-feed.ts) is very small and uses Convex directly.
- This is a good example of the sort of simplicity the rest of the app should aim for when the feature allows it.

Recommendation:

- No action.

### `src/features/auth`

**Verdict:** `Borderline`

Why it mostly works:

- The login and logout buttons are still small components, not a sprawling auth subsystem.
- The Spotify reconnect cooldown in [login-button.tsx](/Users/ethan/w/ironman/src/features/auth/login-button.tsx) is solving a real UX problem.

Why it feels slightly more involved than the feature sounds:

- The login button owns:
  - query-param error handling
  - localStorage-backed cooldown persistence
  - cross-tab cooldown sync
  - timer-driven countdown UI
- That is all understandable, but it is a lot of behavior for a single button.

Recommendation:

- Keep it for now.
- If this area grows again, pull the cooldown logic into a hook instead of letting the button keep accumulating behavior.

### `src/app`

**Verdict:** `Right-sized`

Why it looks better now:

- [app-runtime.tsx](/Users/ethan/w/ironman/src/app/app-runtime.tsx) is much more of a coordinator after the recent split.
- [use-settled-session.ts](/Users/ethan/w/ironman/src/app/use-settled-session.ts) and [use-spotify-connection.ts](/Users/ethan/w/ironman/src/app/use-spotify-connection.ts) give the odd bits of runtime behavior a clear home.
- [router.tsx](/Users/ethan/w/ironman/src/app/router.tsx) is refreshingly boring.

What still stands out:

- `use-spotify-connection.ts` still carries a little subtle state around `lastSpotifyReadyUserId`, but that looks justified by the reconnect UX.

Recommendation:

- Leave `app` alone unless another real runtime concern shows up.

## Next Candidates

The next places worth auditing more deeply are:

1. `spotify/player`, but now at the file level rather than as a folder-wide rescue
2. `spotify/client`, if we want to remove more ceremony
3. `auth`, if we want to simplify the reconnect cooldown behavior
