# Convex Feature Audit

Started: 2026-04-12

## Goal

Audit the Convex backend module-by-module with the same question as the frontend pass:

> Is this the right amount of complexity for the feature's actual intent?

The goal is not to erase useful backend structure. The goal is to notice where we may still be carrying migration scaffolding, wrapper ceremony, or defensive complexity that the product no longer needs.

## Rubric

- `Right-sized`: complexity matches the feature and its failure modes.
- `Borderline`: a little more structure than strictly necessary, but still earning its keep.
- `Overbuilt`: more compatibility, orchestration, or abstraction than the backend seems to need.

## Current Pass

| Module / Area                         | Verdict       | Notes                                                                                         |
| ------------------------------------- | ------------- | --------------------------------------------------------------------------------------------- |
| `ironman.ts`                          | `Right-sized` | Complex, but it is the core game logic.                                                       |
| `leaderboards.ts`                     | `Right-sized` | Summary-backed reads are now the single path.                                                  |
| `songSummaries.ts`                    | `Right-sized` | Narrowed to ongoing summary maintenance instead of rollout bookkeeping.                        |
| `spotify.ts` + `components/spotify/*` | `Right-sized` | Real integration complexity, but a little wrapper repetition remains.                         |
| `songs.ts`                            | `Right-sized` | Reads directly from summaries with no migration branch.                                        |
| `profile.ts`                          | `Right-sized` | Small and proportionate.                                                                      |
| `feed.ts`                             | `Right-sized` | Small and clear.                                                                              |
| `streaks.ts`                          | `Borderline`  | Looks like an admin/import seam more than a hot app path.                                     |
| `betterAuth.ts` + `http.ts`           | `Right-sized` | Auth complexity seems justified.                                                              |
| `schema.ts`                           | `Right-sized` | Reflects current app needs well.                                                              |

## Findings

### `convex/ironman.ts`

**Verdict:** `Right-sized`

Why it feels justified:

- This is the heart of the product, so it is expected to carry real complexity.
- The logic it owns is legitimately domain-heavy:
  - active streak lifecycle
  - weakness accounting
  - hardcore behavior
  - poll-based count progression
  - feed logging
  - song-summary updates
- The helper extractions already in place keep it from feeling like one giant anonymous state machine:
  - [convex/lib/streak.ts](/Users/ethan/w/ironman/convex/lib/streak.ts)
  - [convex/songSummaries.ts](/Users/ethan/w/ironman/convex/songSummaries.ts)

What still stands out:

- There is still some duplicate “serialize streak into app response shape” work between `toStreakData` and inline return objects.
- The file is large, but it still reads as one coherent domain module.

Recommendation:

- Do not simplify this just to make it shorter.
- If we revisit it, aim for small response-shape/helper cleanup, not structural redesign.

### `convex/leaderboards.ts`

**Verdict:** `Right-sized`

Why it mostly works:

- The summary-backed fast paths are a real improvement.
- The queries are much more intentional than they were before the performance work.

Why it looks good now:

- The migration-safe fallback path is gone.
- Summary-backed leaderboards are now the only read path, which matches the current app reality.

Recommendation:

- Leave this module alone unless the board formulas themselves change.

### `convex/songSummaries.ts`

**Verdict:** `Right-sized`

Why it earned its existence:

- Denormalized song summaries were the right answer for leaderboard/song performance.
- The helper logic in [convex/lib/songSummaries.ts](/Users/ethan/w/ironman/convex/lib/songSummaries.ts) is small and clean.

Why it looks good now:

- The backfill bookkeeping and status machinery are gone.
- The file is back to its real job: maintain summary rows incrementally and rebuild them when needed.

Recommendation:

- Leave it alone.

### `convex/spotify.ts` and `convex/components/spotify/*`

**Verdict:** `Right-sized`

Why it feels mostly appropriate:

- The integration genuinely has a lot going on:
  - Better Auth token retrieval
  - user-scoped cache keys
  - Spotify rate limits and 401/403 handling
  - mapping external payloads into app-safe shapes
  - validators and app-facing actions
- The component boundary is good. It keeps the Spotify API machinery out of the main app modules.

What still feels a little ceremonious:

- [convex/spotify.ts](/Users/ethan/w/ironman/convex/spotify.ts) is mostly a wrapper layer around the component:
  - auth/token lookup
  - returns validators
  - action forwarding
- That is not wrong, but it does create a little repetition.
- The wrapper and component both define some mirrored validator/result structure for playback/activity shapes.

Recommendation:

- Keep the component split.
- If we simplify later, do it by trimming wrapper repetition, not by collapsing the component.

### `convex/songs.ts`

**Verdict:** `Right-sized`

Why it is mostly good:

- The summary-backed path is a real improvement.
- The remaining shame-list scan is bounded and understandable.

Why it looks good now:

- The summary path is now the only path.
- The query is short and proportional to the page.

Recommendation:

- Leave it alone.

### `convex/profile.ts`

**Verdict:** `Right-sized`

Why it looks good:

- Small query surface.
- Clear indexing strategy.
- Business logic mostly delegated into [shared/profile-data.ts](/Users/ethan/w/ironman/shared/profile-data.ts), which is a good fit.

Recommendation:

- Leave it alone.

### `convex/feed.ts`

**Verdict:** `Right-sized`

Why it looks good:

- Very small module.
- Clear query for the public feed.
- Internal mutation is idempotent via `sourceId`, which is exactly the right kind of complexity.

Recommendation:

- Leave it alone.

### `convex/streaks.ts`

**Verdict:** `Borderline`

Why it stands out:

- It looks more like an import/admin/upsert seam than a core app path.
- It is doing a legitimate job, but it feels separate from the main runtime flow.

What that means:

- This is not necessarily bad.
- It just reads like “supporting system surface” rather than day-to-day app backend.

Recommendation:

- Keep it if you still use it for ingestion or repair workflows.
- If not, it is a good candidate to either document explicitly as admin tooling or retire.

### `convex/betterAuth.ts` and `convex/http.ts`

**Verdict:** `Right-sized`

Why it looks good:

- Spotify auth is a real integration concern.
- The retry logic for profile fetches in [betterAuth.ts](/Users/ethan/w/ironman/convex/betterAuth.ts) is product-motivated, not decorative.
- [http.ts](/Users/ethan/w/ironman/convex/http.ts) is minimal.

Recommendation:

- Leave this area alone unless auth behavior changes.

### `convex/schema.ts`

**Verdict:** `Right-sized`

Why it looks good:

- The tables line up with the current product architecture.
- The extra indexes mostly correspond to real hot paths.
- The schema does not feel like it is carrying much dead shape anymore.

Recommendation:

- No action right now.

## Main Backend Smell Right Now

The clearest remaining backend smell is milder now:

> some wrapper/admin surfaces are a little more ceremonious than the core product paths

Concretely:

- [convex/spotify.ts](/Users/ethan/w/ironman/convex/spotify.ts)
- [convex/streaks.ts](/Users/ethan/w/ironman/convex/streaks.ts)

Neither looks urgent, but those are the first places I would simplify if we wanted another backend pass.

## Next Candidates

The next backend areas worth auditing more deeply are:

1. the Spotify wrapper layer in [convex/spotify.ts](/Users/ethan/w/ironman/convex/spotify.ts)
2. whether [convex/streaks.ts](/Users/ethan/w/ironman/convex/streaks.ts) is still an active product surface or just supporting tooling
3. any small contract cleanup between app-facing modules and `shared/*`
