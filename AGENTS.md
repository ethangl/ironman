<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.

<!-- convex-ai-end -->

## Remember

- frontend owns UI state and local interaction guards
- convex/spotify.ts owns auth handoff
- convex/components/spotify owns Spotify request policy
- browser-side Better Auth account-link checks are runtime gating, not Spotify request policy
- the browser-side Spotify token path exists only for the Web Playback SDK and playback actions that genuinely need a browser token
- do not mint a browser Spotify token on startup just to determine general app capability or connection state
