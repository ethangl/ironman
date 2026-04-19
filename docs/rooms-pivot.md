# Rooms Pivot

Started: 2026-04-19

Status: Accepted product direction

## Decision Summary

This is a true product pivot away from song streaks.

The old core loop was:

- pick a song
- lock in
- enforce staying on that exact song
- count repeated completions
- track weakness and surrender
- build song-level stats and leaderboards

The new core loop is:

- join a room
- listen to the room's queue
- hear whatever the room is currently playing
- interact with the room through queue and playback controls

Because this is a real pivot, we should not preserve the old streak model as a compatibility layer. Song streaks, moments of weakness, hardcore, song lock-ins, and song-based leaderboard logic should be removed rather than adapted.

## Product Principles

### Rooms, not streaks

The product unit is now a room, not a song attempt.

Users are not making an individual promise to stay on a track. They are entering a shared listening space with a queue and a shared playback state.

### Shared room state is canonical

The canonical source of truth should live in Convex as room state.

Spotify playback on a user device is an execution detail. It should follow room state, not define room state.

### Local player state stays local

The browser can still keep local UI state for:

- volume
- expanded or collapsed player chrome
- in-flight playback requests
- local optimistic queue UI

But the room queue and room playback position must not be stored only in local React state.

### Be conservative with Spotify requests

Spotify is rate-sensitive, and the app already documents that 429 windows can be severe.

That means the room system should prefer:

- Convex as the room state authority
- sparse, explicit playback sync
- local computation of expected room playback from stored timestamps
- user-triggered repair when sync drifts

It should avoid:

- frequent polling of Spotify to ask what the room is doing
- background resync loops that hit Spotify as a normal control path
- one-Spotify-call-per-listener fan-out patterns

## What We Are Removing

The following concepts are no longer part of the product:

- song lock-in
- active streaks tied to a single track
- weakness reporting
- hardcore mode
- surrender as the primary failure mechanic
- song challenge flow
- song-based ironman boards and streak stats

This likely means deleting or fully replacing these current areas:

- `convex/ironman.ts`
- `convex/songSummaries.ts`
- `convex/streaks.ts`
- `convex/leaderboards.ts`
- `convex/songs.ts`
- `src/features/ironman/*`
- `src/routes/song-route.tsx`
- `src/routes/challenge-route.tsx`
- lock-in and hardcore controls in `src/features/spotify/player/*`

## Current Architecture That Assumes Song Streaks

### Backend

The current backend is strongly centered on a single active song per user:

- `convex/schema.ts` defines a `streaks` table with `trackId`, `count`, `hardcore`, `weaknessCount`, and `lastCompletionArmed`.
- `convex/ironman.ts` owns streak lifecycle, count progression, weakness reporting, and surrender.
- `convex/songSummaries.ts` materializes per-song aggregate stats from streak history.
- `convex/leaderboards.ts` builds global and track-level boards from streak and song summary data.
- `convex/feed.ts` logs lock-in and surrender events.

### Frontend

The current frontend assumes the active gameplay target is one exact track:

- `src/features/ironman/enforcement-engine.tsx` treats any track mismatch as a wrong-song event.
- `src/features/ironman/use-wrong-song-enforcement.ts` force-corrects playback back to the locked song.
- `src/features/ironman/use-ironman-player-actions.ts` starts and ends song streaks.
- `src/features/spotify/player/use-now-playing.ts` prefers streak track metadata over normal playback.
- `src/features/spotify/player/lock-in-button.tsx` and `hardcore-button.tsx` expose the current game loop in the player.

### Existing queue code we can reuse conceptually

The app already has queue mechanics in the browser:

- `src/features/spotify/player/use-player-playback.ts`
- `src/features/spotify/player/player-queue-state.ts`

This is useful as a local playback abstraction, but it is not yet a shared room queue. Today it is device-local state.

## Target Architecture

### Naming and code organization

We should treat this as a rename, not just a behavior change.

If the new product is rooms, future code should prefer `rooms` naming over continuing to overload `ironman`.

That means favoring new modules such as:

- `convex/rooms.ts`
- `src/features/rooms/*`

Instead of keeping room behavior inside files or public APIs that still describe the old streak product.

### Core backend model

The new backend should be organized around four room concepts.

### `rooms`

Stable room metadata.

Suggested fields:

- `roomId`
- `slug`
- `name`
- `description`
- `ownerUserId`
- `visibility`
- `createdAt`
- `archivedAt`

### `roomMemberships`

Who is in a room and what their role is.

Suggested fields:

- `roomId`
- `userId`
- `role`
- `active`
- `joinedAt`
- `leftAt`

### `roomQueueItems`

One document per queued track.

Suggested fields:

- `roomId`
- `position`
- `trackId`
- `trackName`
- `trackArtist`
- `trackImage`
- `trackDuration`
- `addedByUserId`
- `addedAt`
- `removedAt`

Important note:

Do not store the room queue as one unbounded array on a room document. A queue is a growing list and should live in its own table.

### `roomPlaybackStates`

The canonical room clock and current selection.

Suggested fields:

- `roomId`
- `currentQueueItemId`
- `startedAt`
- `startOffsetMs`
- `paused`
- `pausedAt`
- `updatedAt`

This table should be the basis for answering:

- what track should this room be on
- when did that track start
- what playback offset should a joining listener use

### Core API shape

The first room API should be intentionally small.

### Room management

- `rooms.list`
- `rooms.get`
- `rooms.create`
- `rooms.join`
- `rooms.leave`

### Queue management

- `rooms.enqueueTrack`
- `rooms.removeQueueItem`
- `rooms.moveQueueItem`
- `rooms.clearQueue`

### Playback management

- `rooms.getPlaybackState`
- `rooms.play`
- `rooms.pause`
- `rooms.resume`
- `rooms.skip`
- `rooms.syncListener`

### Playback model

The room should have a canonical clock.

That means a listener joining room `X` should not ask, "What is my Spotify player doing?"

It should ask:

- what queue item is room `X` currently on
- when did it start
- what offset should I start at right now

Then the client should apply that state to the local player.

### Recommended defaults

To keep implementation simpler and product behavior predictable, start with these defaults:

- rooms are persistent, named spaces
- anyone in the room can enqueue tracks
- owner can skip and reorder
- room playback pauses when the room is empty
- when a user joins an active room, the client tries to start the current room track at the current room offset

## Frontend Shape

The frontend should also pivot from "ironman" language to "rooms" language.

Suggested feature areas:

- `src/features/rooms/client`
- `src/features/rooms/runtime`
- `src/features/rooms/queue`
- `src/features/rooms/ui`

### Replace the enforcement engine with a room sync engine

The current enforcement engine is designed to punish divergence from a locked song.

The new room runtime should do a different job:

- subscribe to room state
- compute expected local playback from room timestamps
- start playback when joining
- repair drift when the user explicitly rejoins or when drift is clearly detected

The mental model changes from:

- "You played the wrong song"

to:

- "Your player is out of sync with the room"

### Keep the local queue helper, but repurpose it

The existing queue code in `src/features/spotify/player/use-player-playback.ts` and `src/features/spotify/player/player-queue-state.ts` can still be useful, but it should be treated as a local rendering and playback helper for room queue data.

The source of truth for queue ordering should be Convex room queue state, not browser state alone.

## Spotify Transport Requirement

Room playback requires offset-aware playback start.

Today the Spotify play path only starts a track from the beginning:

- `src/features/spotify/client/spotify-playback-client.ts`
- `convex/spotify.ts`
- `convex/components/spotify/playback.ts`
- `convex/components/spotify/playbackApi.ts`

To support room joins and resync, we will need end-to-end support for:

- start track at offset milliseconds
- possibly target a specific device

Without offset support, listeners can only join at the start of the song, which breaks the room model.

## UX Surfaces Likely To Change

### Player UI

Replace:

- lock-in button
- hardcore button
- streak count display

With:

- join room button
- leave room button
- room name
- room queue
- synced / out-of-sync state
- room controls based on role

### Routes

Likely retire or redesign:

- `song/:trackId`
- `challenge/:trackId`

Likely add:

- `rooms`
- `rooms/:roomId`
- room creation or discovery surfaces

### Home

The home page will need a new purpose once song boards are gone.

Likely replacements:

- active rooms
- popular rooms
- recently active rooms
- recently added queue items

## Live Feed

The live feed should pivot from streak events to room events.

Replace lock-in and surrender style events with room events such as:

- joined room
- left room
- queued track
- skipped track
- room started playing

This likely requires replacing the current feed event schema in `convex/feed.ts`.

## Migration Strategy

Because this is a true pivot, we should optimize for clean replacement rather than compatibility scaffolding.

Preferred strategy:

Remove the old model first.

This is a better fit for the product decision than trying to keep streaks alive while rooms are built beside them.

Why this is preferable:

- it prevents us from spending time on a model we already decided to kill
- it avoids dual-model code paths and migration glue
- it reduces the temptation to keep old concepts like weakness or lock-in alive under new names
- it forces new room code to stand on its own terms

Main tradeoff:

There may be an intentional transition period where the app has reduced or missing core gameplay while rooms are under construction.

That is acceptable if we want the cleanest architecture and the clearest product reset.

### Phase 1: Remove old model and surfaces

- remove streak, weakness, hardcore, surrender, and challenge language from the main app direction
- delete or disable old player controls tied to lock-in behavior
- remove old song-board and song-stats product surfaces
- treat any remaining old code as temporary cleanup debt, not active product code

Deliverable:

- the app no longer presents the song-streak loop as a live product feature

### Phase 2: Delete legacy backend and frontend code

- remove `convex/ironman.ts`
- remove `convex/songSummaries.ts`
- remove `convex/streaks.ts`
- remove `convex/leaderboards.ts`
- remove `convex/songs.ts`
- remove `src/features/ironman/*`
- remove old tests for streak, weakness, hardcore, and song-board behavior

Deliverable:

- no active product-critical code depends on the streak model

### Phase 3: Add room backend foundations

- add `rooms`
- add `roomMemberships`
- add `roomQueueItems`
- add `roomPlaybackStates`
- implement minimal room queries and mutations

Deliverable:

- a Convex backend that can create a room, join a room, enqueue tracks, and read canonical room playback state

### Phase 4: Add playback transport support

- extend Spotify play actions to support playback offset
- thread that support through Convex and the browser client
- add tests around offset playback requests

Deliverable:

- client can start track `T` at room offset `O`

### Phase 5: Build room runtime, UI, and surrounding app surfaces

- add room queries and room subscriptions on the frontend
- replace lock-in flow with join room flow
- build room queue UI
- add room playback sync behavior
- replace old home leaderboard content
- replace song and challenge routes
- update live feed to room events
- remove streak-specific player UI

Deliverable:

- user can join a room, hear the room's current track, and the app no longer exposes the old ironman loop in the main UI

## Definition Of Done

We should consider the pivot complete when all of the following are true:

- users join rooms instead of locking into songs
- room queue and playback state live in Convex
- client can start playback at the correct room offset
- player UI is room-centric instead of streak-centric
- song streak, weakness, hardcore, and challenge surfaces are gone
- old streak-backed leaderboards and song stats are gone

## Open Questions

These do not block the pivot document, but they will shape implementation details:

- Can any room member reorder the queue, or only the owner?
- Should rooms pause when empty, or continue advancing on wall-clock time?
- Do we want public and private rooms in the first version?
- Do we want any room-level scoring or badges, or no competitive mechanic at all at launch?
- Should the room auto-advance strictly by stored durations, or only when an explicit skip or next action happens?

## Recommended answers for now

If we want to move quickly, use these defaults unless product direction changes:

- owner controls skip and reorder
- anyone in the room can enqueue
- rooms pause when empty
- support public rooms first
- no scoring, no badges, no replacement for weakness in v1
- auto-advance from the canonical room clock

## Non-Goals

The first room pivot should not try to preserve or emulate the old product:

- no compatibility layer that maps rooms back into streaks
- no attempt to keep song difficulty or banger / hellscape boards alive
- no weakness-inspired punishment system under a different name
- no per-song challenge flow unless a later product need clearly justifies it
