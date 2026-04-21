<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.

<!-- convex-ai-end -->

## Remember: Separation of Concerns

- frontend owns UI state and local interaction guards
- convex/spotify.ts owns auth handoff
- browser-side Better Auth account-link checks are runtime gating, not Spotify request policy
- the browser-side Spotify token path exists only for the Web Playback SDK and playback actions that genuinely need a browser token
- do not mint a browser Spotify token on startup just to determine general app capability or connection state
- convex/spotify owns Spotify request policy

## Remember: Spotify's API

- the Spotify API is extremely rate-sensitive; `429` cooldown windows can last 6+ hours, so be conservative when adding new queries
- prefer one-time reads, durable caching, local state updates, and explicit user-triggered refresh over polling or background re-sync
- treat `429` handling as emergency fallback, not as a normal control-flow strategy; if we are seeing Spotify `429`s in ordinary app usage, the query design is wrong and should be reduced or restructured
