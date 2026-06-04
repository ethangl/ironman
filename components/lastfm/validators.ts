import { v } from "convex/values";

export const lastFmArtistStatsValidator = v.object({
  listeners: v.union(v.number(), v.null()),
  playcount: v.union(v.number(), v.null()),
});

export const lastFmArtistBioValidator = v.object({
  summary: v.union(v.string(), v.null()),
  published: v.union(v.string(), v.null()),
});

export const lastFmArtistTagValidator = v.object({
  name: v.string(),
  url: v.union(v.string(), v.null()),
});

export const lastFmSimilarArtistValidator = v.object({
  name: v.string(),
  musicBrainzId: v.union(v.string(), v.null()),
  url: v.union(v.string(), v.null()),
});

export const lastFmArtistMatchValidator = v.object({
  artistName: v.string(),
  musicBrainzId: v.union(v.string(), v.null()),
  resolvedVia: v.union(v.literal("musicbrainz_id"), v.literal("artist_name")),
  lastFmUrl: v.union(v.string(), v.null()),
  stats: lastFmArtistStatsValidator,
  bio: lastFmArtistBioValidator,
  topTags: v.array(lastFmArtistTagValidator),
  similarArtists: v.array(lastFmSimilarArtistValidator),
});
