export interface TrackAudioFeaturesRecord {
  spotifyTrackId: string;
  isrc?: string;
  acousticness: number;
  danceability: number;
  energy: number;
  instrumentalness: number;
  key: number;
  liveness: number;
  loudness: number;
  mode: number;
  speechiness: number;
  tempo: number;
  valence: number;
  fetchedAt: number;
}

interface ReccobeatsAudioFeaturesItem {
  href: string;
  isrc?: string;
  acousticness: number;
  danceability: number;
  energy: number;
  instrumentalness: number;
  key: number;
  liveness: number;
  loudness: number;
  mode: number;
  speechiness: number;
  tempo: number;
  valence: number;
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isReccobeatsAudioFeaturesItem(
  value: unknown,
): value is ReccobeatsAudioFeaturesItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.href === "string" &&
    (item.isrc === undefined || typeof item.isrc === "string") &&
    isNumber(item.acousticness) &&
    isNumber(item.danceability) &&
    isNumber(item.energy) &&
    isNumber(item.instrumentalness) &&
    isNumber(item.key) &&
    isNumber(item.liveness) &&
    isNumber(item.loudness) &&
    isNumber(item.mode) &&
    isNumber(item.speechiness) &&
    isNumber(item.tempo) &&
    isNumber(item.valence)
  );
}

export function uniqueTrackIds(trackIds: string[]) {
  return [...new Set(trackIds.map((trackId) => trackId.trim()).filter(Boolean))];
}

export function parseSpotifyTrackIdFromHref(href: string) {
  const match = href.match(/\/track\/([^/?#]+)/);
  return match?.[1] ?? null;
}

export function normalizeTrackAudioFeaturesResponse({
  requestedTrackIds,
  response,
  fetchedAt,
}: {
  requestedTrackIds: string[];
  response: unknown;
  fetchedAt: number;
}) {
  if (!response || typeof response !== "object") {
    throw new Error("Invalid ReccoBeats audio features response.");
  }

  const content = (response as { content?: unknown }).content;
  if (!Array.isArray(content)) {
    throw new Error("Invalid ReccoBeats audio features response.");
  }

  const requestedIdSet = new Set(uniqueTrackIds(requestedTrackIds));
  const recordsByTrackId = new Map<string, TrackAudioFeaturesRecord>();

  for (const item of content) {
    if (!isReccobeatsAudioFeaturesItem(item)) {
      throw new Error("Invalid ReccoBeats audio features item.");
    }

    const spotifyTrackId = parseSpotifyTrackIdFromHref(item.href);
    if (!spotifyTrackId || !requestedIdSet.has(spotifyTrackId)) {
      continue;
    }

    recordsByTrackId.set(spotifyTrackId, {
      spotifyTrackId,
      isrc: item.isrc,
      acousticness: item.acousticness,
      danceability: item.danceability,
      energy: item.energy,
      instrumentalness: item.instrumentalness,
      key: item.key,
      liveness: item.liveness,
      loudness: item.loudness,
      mode: item.mode,
      speechiness: item.speechiness,
      tempo: item.tempo,
      valence: item.valence,
      fetchedAt,
    });
  }

  const records = [...recordsByTrackId.values()];
  const foundTrackIds = new Set(records.map((record) => record.spotifyTrackId));
  const missingTrackIds = [...requestedIdSet].filter(
    (trackId) => !foundTrackIds.has(trackId),
  );

  return { records, missingTrackIds };
}
