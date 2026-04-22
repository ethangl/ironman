import { v } from "convex/values";

type SpotifyPageItemValidator = Parameters<typeof v.array>[0];

export const spotifyTrackValidator = v.object({
  id: v.string(),
  name: v.string(),
  artist: v.string(),
  albumName: v.string(),
  albumImage: v.union(v.string(), v.null()),
  durationMs: v.number(),
});

export const spotifyArtistValidator = v.object({
  id: v.string(),
  name: v.string(),
  image: v.union(v.string(), v.null()),
  followerCount: v.number(),
  genres: v.array(v.string()),
});

export const spotifyPlaylistValidator = v.object({
  id: v.string(),
  name: v.string(),
  description: v.union(v.string(), v.null()),
  image: v.union(v.string(), v.null()),
  owner: v.union(v.string(), v.null()),
  public: v.boolean(),
  trackCount: v.number(),
});

export const spotifyRecentlyPlayedItemValidator = v.object({
  playedAt: v.string(),
  track: spotifyTrackValidator,
});

export const spotifyRecentlyPlayedResultValidator = v.object({
  items: v.array(spotifyRecentlyPlayedItemValidator),
  rateLimited: v.boolean(),
});

export const spotifyPlaylistsPageValidator = v.object({
  items: v.array(spotifyPlaylistValidator),
  total: v.number(),
});

export const spotifyAlbumReleaseValidator = v.object({
  id: v.string(),
  name: v.string(),
  image: v.union(v.string(), v.null()),
  releaseDate: v.union(v.string(), v.null()),
  totalTracks: v.number(),
  albumType: v.union(v.string(), v.null()),
});

export const spotifyPageInfoValidator = v.object({
  offset: v.number(),
  limit: v.number(),
  total: v.number(),
  nextOffset: v.union(v.number(), v.null()),
  hasMore: v.boolean(),
});

export function createSpotifyPageValidator<T extends SpotifyPageItemValidator>(
  itemValidator: T,
) {
  return v.object({
    items: v.array(itemValidator),
    offset: v.number(),
    limit: v.number(),
    total: v.number(),
    nextOffset: v.union(v.number(), v.null()),
    hasMore: v.boolean(),
  });
}

export const spotifyAlbumReleasePageValidator =
  createSpotifyPageValidator(spotifyAlbumReleaseValidator);

export const spotifySearchResultsValidator = v.object({
  tracks: v.array(spotifyTrackValidator),
  artists: v.array(spotifyArtistValidator),
  playlists: v.array(spotifyPlaylistValidator),
});

export const spotifyArtistPageDataValidator = v.object({
  artist: spotifyArtistValidator,
  topTracks: v.array(spotifyTrackValidator),
  albums: spotifyAlbumReleasePageValidator,
  singles: spotifyAlbumReleasePageValidator,
});

export const spotifyPlaybackArtistValidator = v.object({
  name: v.string(),
});

export const spotifyPlaybackItemValidator = v.union(
  v.object({
    id: v.string(),
    name: v.string(),
    duration_ms: v.number(),
    artists: v.optional(v.array(spotifyPlaybackArtistValidator)),
  }),
  v.null(),
);

export const spotifyPlaybackStateValidator = v.union(
  v.object({
    is_playing: v.boolean(),
    progress_ms: v.number(),
    item: spotifyPlaybackItemValidator,
  }),
  v.null(),
);

export const spotifyPlaybackResultValidator = v.object({
  ok: v.boolean(),
  retryAfterSeconds: v.optional(v.number()),
  status: v.number(),
});

export const spotifyPlaybackCurrentlyPlayingResultValidator = v.object({
  retryAfterSeconds: v.optional(v.number()),
  status: v.number(),
  playback: spotifyPlaybackStateValidator,
});
