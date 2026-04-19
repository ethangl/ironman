import { v } from "convex/values";

export const musicBrainzArtistValidator = v.object({
  id: v.string(),
  name: v.string(),
  sortName: v.union(v.string(), v.null()),
  type: v.union(v.string(), v.null()),
  country: v.union(v.string(), v.null()),
  disambiguation: v.union(v.string(), v.null()),
  spotifyUrl: v.string(),
  musicBrainzUrl: v.string(),
});

export const musicBrainzArtistLinksValidator = v.object({
  homepage: v.union(v.string(), v.null()),
  instagram: v.union(v.string(), v.null()),
  youtube: v.union(v.string(), v.null()),
  bandcamp: v.union(v.string(), v.null()),
});

export const musicBrainzArtistMatchValidator = v.object({
  spotifyArtistId: v.string(),
  spotifyUrl: v.string(),
  resolvedVia: v.literal("spotify_url"),
  matchCount: v.number(),
  artist: musicBrainzArtistValidator,
  links: musicBrainzArtistLinksValidator,
});
