# Rooms Invariants Roadmap

Started: 2026-04-19

Companion doc: [rooms-pivot.md](/Users/ethan/w/ironman/docs/rooms-pivot.md)

## Purpose

This document is a checklist of truths that must become true, in order, for the rooms pivot to succeed.

The key idea:

- the pivot doc explains direction
- this roadmap explains implementation order

This is intentionally written as invariants rather than feature tickets.

If an invariant in an earlier section is not true yet, we should avoid building later layers that depend on it.

## How To Use This

- treat each section as a gate
- do not skip ahead just because a UI looks easy to mock
- when a box is checked, it should be true in the codebase, not just in our heads
- if a later box reveals a missing earlier invariant, come back and fix the earlier layer instead of patching around it

## Gate 1: Product Cutover

These boxes make the old model no longer the active product.

- [x] The app no longer presents song lock-in as the main gameplay loop.
- [x] The app no longer presents weakness, hardcore, surrender, or challenge as active product concepts.
- [x] Old song-board and song-stats surfaces are removed or disabled as product destinations.
- [x] We are no longer making implementation decisions in order to preserve streak compatibility.

Exit condition:

The old model is not the product we are actively shipping, even if some cleanup debt still exists in code.

## Gate 2: Legacy Deletion

These boxes ensure we are not carrying the old product as hidden runtime dependency.

- [x] `convex/ironman.ts` is removed or no longer part of the active app path.
- [x] `convex/songSummaries.ts` is removed or no longer part of the active app path.
- [x] `convex/streaks.ts` is removed or no longer part of the active app path.
- [x] `convex/leaderboards.ts` is removed or no longer part of the active app path.
- [x] `convex/songs.ts` is removed or no longer part of the active app path.
- [x] `src/features/ironman/*` is removed or no longer part of the active app path.
- [x] Player UI no longer depends on lock-in-only controls.
- [x] Legacy tests that only verify streak mechanics are removed or replaced.

Exit condition:

No active product-critical behavior depends on the streak model.

## Gate 3: Naming And Boundary Reset

These boxes keep us from rebuilding rooms inside leftover `ironman` boundaries.

- [x] New backend room behavior is implemented in room-named modules such as `convex/rooms.ts`, not hidden inside `convex/ironman.ts`.
- [x] Public APIs and client contracts use room language instead of streak language.
- [x] New code does not overload old domain terms like `lockIn`, `hardcore`, `weakness`, or `streak` to mean room concepts.

Exit condition:

The new architecture is allowed to be itself, instead of wearing the shape of the deleted product.

## Gate 4: Room Data Model

These boxes establish the shared backend source of truth.

- [x] A `rooms` table exists for stable room metadata.
- [x] A `roomMemberships` table exists for membership and role state.
- [x] A `roomQueueItems` table exists with one document per queued track.
- [x] A `roomPlaybackStates` table exists for the canonical room clock.
- [x] Queue data is not stored as one unbounded array on a room document.
- [x] Table indexes support the primary reads we expect to use: room by id or slug, active memberships by room and by user, queue items by room and order, and playback state by room.

Exit condition:

Convex can represent a room, who is in it, what is queued, and what should be playing.

## Gate 5: Room Authorization And Membership Rules

These boxes define who can do what.

- [x] A user can join a room through server-owned auth, not by passing arbitrary user ids.
- [x] A user can leave a room cleanly.
- [x] Membership state distinguishes active members from historical joins.
- [x] Room ownership or moderator authority is represented explicitly.
- [x] Queue and playback mutations enforce role checks on the server.
- [x] The initial permission rules are explicit and implemented: any member may enqueue, and only owner or moderator may reorder or skip.

Exit condition:

Room actions are governed by room membership rules, not by frontend convention.

## Gate 6: Queue Invariants

These boxes make the queue a reliable shared object.

- [x] Queue order is canonical in Convex.
- [x] Adding a track inserts one queue item document with enough track snapshot data to render immediately.
- [x] Removing a queue item is a server mutation with stable ordering semantics afterward.
- [x] Reordering queue items is a server mutation with stable ordering semantics afterward.
- [x] Reading a room queue returns a deterministic order.
- [x] Reading a room queue returns only `up next` items; the currently playing track is rendered from playback state instead of being duplicated in the queue.
- [x] Queue mutations operate on `up next` items only; the currently playing track is not reorderable or removable as part of the queue.
- [x] The queue can be rendered without asking Spotify for more metadata in the hot path.
- [x] Browser-local queue state is not treated as the source of truth for room order.

Exit condition:

The room queue is a shared Convex object that every client can render consistently.

## Gate 7: Playback Clock Invariants

These boxes define what it means for a room to be "playing."

- [x] Each room has a canonical playback state in Convex.
- [x] Playback state identifies the current queue item.
- [x] Playback state records when the current track started.
- [x] Playback state records the starting offset in milliseconds.
- [x] Playback state can represent paused vs active playback.
- [x] Playback responses include enough current-track snapshot data to render now playing even when the current track is no longer present in the queue payload.
- [x] There is one server-side rule for computing the expected current room offset from stored timestamps.
- [x] There is one server-side rule for advancing to the next queue item.
- [x] The room clock has a server-owned non-playing state for cases where no active track should advance.

Exit condition:

Given only room state and current time, the app can answer what a room should be playing right now.

## Gate 8: Spotify Transport Support

These boxes give the client enough transport power to follow room state.

- [x] The Spotify play path supports starting playback at a provided offset in milliseconds.
- [x] That offset support is threaded through Convex actions and browser client code.
- [x] Offset playback is test-covered.

Exit condition:

The local player can be pointed at the room's current track and current offset.

## Gate 9: Frontend Room Runtime

These boxes replace punitive enforcement with room sync.

- [x] New frontend room behavior is implemented under `src/features/rooms/*`, not as more extensions to `src/features/ironman/*`.
- [x] There is a room runtime on the frontend that subscribes to room state.
- [x] Joining a room causes the client to fetch or subscribe to the canonical room state.
- [x] The runtime computes expected local playback from room timestamps.
- [x] The runtime can attempt an initial playback sync when joining.
- [x] The runtime can react to canonical room playback changes without depending on local drift-detection loops.
- [x] The runtime does not treat passive local drift as a product error that must be continuously repaired.
- [x] The runtime does not reintroduce wrong-song enforcement concepts under new names.
- [x] Any optimistic UI around queue actions reconciles back to Convex state.
- [x] Joining a room does not require repeated Spotify polling just to derive room state.
- [x] Rejoining the room does not depend on aggressive background Spotify calls.

Exit condition:

The browser behaves like a room listener, not like a song-streak enforcer.

## Gate 10: Room UI Surfaces

These boxes make the new product visible and usable.

- [x] The player UI is room-centric.
- [x] The player exposes join and leave behavior instead of lock-in and surrender.
- [x] The room queue is visible in the UI.
- [x] The UI can show whether this device is listening live or detached from the room.
- [x] Room controls are shown or hidden based on role.
- [x] There is a room discovery or room list surface.
- [x] There is a shareable room detail URL such as `?roomId=<roomId>`, with legacy `rooms/:roomId` links redirected intentionally.
- [x] Old routes like `song/:trackId` and `challenge/:trackId` are removed or redirected intentionally.

Exit condition:

A user can understand and use the product as "rooms" without seeing legacy streak concepts.

## Gate 11: Supporting App Surfaces

These boxes update the rest of the app so it fits the new product.

- [x] Home has a room-based purpose.
- [x] Live feed uses room events instead of lock-in and surrender events.
- [x] Share and navigation surfaces point people into rooms instead of song streak pages.
- [x] Empty states, copy, and labels throughout the app no longer describe the old model.

Exit condition:

The surrounding app reinforces the room product instead of referencing a deleted game loop.

## Gate 12: Playback Mechanic Refinement

These boxes refine the room from "shared pause state" toward "continuous stream with local listener attachment."

- [x] Room playback can continue advancing on wall-clock time even when no listener is currently attached.
- [x] Leaving the last room membership does not implicitly pause the room clock.
- [x] A local stop-listening action does not mutate canonical room playback state.
- [x] Rejoining on a device starts from the current room offset, as if the user had just joined the room.
- [x] Shared room pause and resume are no longer the primary listener control model.
- [ ] Player copy prefers `listen live`, `stop listening`, and `sync to room` language over shared `pause` and `resume`.
- [x] Listener attachment is treated as local transport state, not room authority.
- [ ] Room-authority controls and local listener controls are distinct in both behavior and copy.

Exit condition:

The room behaves like a continuously advancing stream, and whether a device is currently listening is a local concern.

## Gate 13: Launch Readiness

These boxes make the pivot feel complete rather than half-translated.

- [x] Users join rooms instead of locking into songs.
- [x] Room queue and playback state live in Convex.
- [x] Local playback can start at the correct room offset.
- [x] The app no longer depends on streak, weakness, hardcore, or challenge mechanics.
- [x] The app no longer depends on song-summary or song-board product surfaces.
- [ ] The app language is coherent and consistently room-based.

Exit condition:

The room pivot is complete enough that a new user would describe the product as room-based listening, not as a stripped-down version of the old ironman mode.

## Things To Watch For

- If we find ourselves adding compatibility glue, stop and ask whether Gate 2 is incomplete.
- If we find ourselves storing room queue only in React state, stop and ask whether Gate 4 or Gate 6 is incomplete.
- If we find ourselves building room UI before offset playback works, stop and ask whether Gate 8 is incomplete.
- If we find ourselves reintroducing punishment or wrong-song logic, stop and ask whether we are smuggling the old product back in.
- If we find ourselves treating "nobody is listening right now" as a reason to stop the room clock, stop and ask whether Gate 12 is incomplete.
