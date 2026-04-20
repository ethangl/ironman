# Rooms Pivot

Started: 2026-04-19

Status: Accepted product direction

## Product Principles

The product unit is a "room". Users are entering a shared listening space with a queue and a shared playback state.

The core loop is:

- join a room
- listen to the room's queue
- hear whatever the room is currently playing
- interact with the room through queue and playback controls

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
- sync on room entry, room playback changes, and explicit user-triggered rejoin

It should avoid:

- frequent polling of Spotify to ask what the room is doing
- background resync loops that hit Spotify as a normal control path
- one-Spotify-call-per-listener fan-out patterns
- continuous drift repair that treats local playback variance as a room error

## Existing queue code we can reuse conceptually

The app already has queue mechanics in the browser:

- `src/features/spotify/player/use-player-playback.ts`
- `src/features/spotify/player/player-queue-state.ts`

This is useful as a local playback abstraction, but it is not yet a shared room queue. Today it is device-local state.

## Target Architecture

### Naming and code organization

We should treat this as a rename, not just a behavior change.

If the new product is rooms, future code should prefer `rooms` naming over continuing to overload the old `ironman`.

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

Note:

Phase 6 is expected to refine listener-facing pause and resume away from shared room controls and toward local stop-listening and rejoin semantics.

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
- once a room has started, its playback clock can continue advancing on wall-clock time even if nobody is currently listening
- local stop listening is device-local, and rejoining starts from the current room offset
- when a user joins an active room, the client tries to start the current room track at the current room offset

## Frontend Shape

The frontend should also pivot from "ironman" language to "rooms" language.

Suggested feature areas:

- `src/features/rooms/client`
- `src/features/rooms/runtime`
- `src/features/rooms/queue`
- `src/features/rooms/ui`

### Create a room sync engine

The old enforcement engine was designed to punish divergence from a locked song.

The new room runtime should do a different job:

- subscribe to room state
- compute expected local playback from room timestamps
- start playback when joining
- rejoin the room at the current room offset when the user explicitly chooses to listen live again
- react to room playback changes without treating passive local drift as something to police

The mental model is:

- "This device can listen live to the room, or stop listening and later rejoin"

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

Add:

- join room button
- leave room button
- listen live / stop listening controls
- room name
- room queue
- live / detached listener state
- room controls based on role

### Routes

Add:

- `home`
- Spotify detail routes such as `artist/:artistId`
- room detail URL state via `?roomId=<roomId>`
- `rooms/:roomId` as a compatibility redirect while links migrate
- room creation or discovery surfaces

### Home

Likely additions:

- active rooms
- popular rooms
- recently active rooms
- recently added queue items

## Room Feed

Display room events such as:

- joined room
- left room
- queued track
- skipped track
- room started playing

This likely requires replacing the current feed event schema in `convex/feed.ts`.

## Migration Strategy

### Phase 1: Remove old model and surfaces

Status: complete

### Phase 2: Delete legacy backend and frontend code

Status: complete

### Phase 3: Add room backend foundations

Status: complete

- add `rooms`
- add `roomMemberships`
- add `roomQueueItems`
- add `roomPlaybackStates`
- implement minimal room queries and mutations

Deliverable:

- a Convex backend that can create a room, join a room, enqueue tracks, and read canonical room playback state

### Phase 4: Add playback transport support

Status: complete

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
- display live feed of room events

Deliverable:

- user can join a room and hear the room's current track

### Phase 6: Playback mechanic refinement

- refine the room clock so it can continue advancing even when nobody is currently listening
- treat local pause as device-local stop listening, not shared room pause
- make local resume behave like rejoining the room at the current canonical offset
- simplify the runtime so passive local drift is not a room-level error condition
- update player language toward `listen live`, `stop listening`, and `sync to room`

Deliverable:

- a user can stop listening locally and later rejoin the room without affecting canonical room playback

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
- Do we want public and private rooms in the first version?
- Do we want any room-level scoring or badges, or no competitive mechanic at all at launch?
- Should the room auto-advance strictly by stored durations, or only when an explicit skip or next action happens?
- Do we ever want explicit shared room pause and resume controls after launch, or should the product stay with local stop-listening and rejoin mechanics only?

## Recommended answers for now

If we want to move quickly, use these defaults unless product direction changes:

- owner controls skip and reorder
- anyone in the room can enqueue
- once playback has started, the room clock continues on wall-clock time even if nobody is currently listening
- local pause and resume are modeled as stop listening and rejoin at the current room offset
- support public rooms first
- no scoring, no badges, no replacement for weakness in v1
- auto-advance from the canonical room clock

## Non-Goals

The first room pivot should not try to preserve or emulate the old product:

- no compatibility layer that maps rooms back into streaks
- no attempt to keep song difficulty or banger / hellscape boards alive
- no weakness-inspired punishment system under a different name
- no per-song challenge flow unless a later product need clearly justifies it
