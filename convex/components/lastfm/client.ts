import { LastFmApiError } from "./errors";

const LASTFM_API = "https://ws.audioscrobbler.com/2.0/";
const LASTFM_USER_AGENT = "ironman/0.1.0 (Last.fm artist enrichment lookup)";
const LASTFM_TAG_LIMIT = 8;
const LASTFM_SIMILAR_ARTIST_LIMIT = 8;

export interface LastFmArtistStats {
  listeners: number | null;
  playcount: number | null;
}

export interface LastFmArtistBio {
  summary: string | null;
  published: string | null;
}

export interface LastFmArtistTag {
  name: string;
  url: string | null;
}

export interface LastFmSimilarArtist {
  name: string;
  musicBrainzId: string | null;
  url: string | null;
}

export interface LastFmArtistMatch {
  artistName: string;
  musicBrainzId: string | null;
  resolvedVia: "musicbrainz_id" | "artist_name";
  lastFmUrl: string | null;
  stats: LastFmArtistStats;
  bio: LastFmArtistBio;
  topTags: LastFmArtistTag[];
  similarArtists: LastFmSimilarArtist[];
}

function logLastFmRequest(details: {
  resource: string;
  status: number;
  durationMs: number;
}) {
  if (process.env.NODE_ENV === "test") return;

  console.info(
    `[lastfm] GET ${details.resource} status=${details.status} duration=${details.durationMs}ms`,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

function getNullableString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function getNullableNumber(
  record: Record<string, unknown>,
  key: string,
): number | null {
  const value = record[key];
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toRecordArray(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }

  return isRecord(value) ? [value] : [];
}

function decodeHtmlEntities(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&nbsp;", " ");
}

function cleanBioSummary(summary: string | null) {
  if (!summary) {
    return null;
  }

  const text = decodeHtmlEntities(summary.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .replace(/\s*Read more on Last\.fm\.?\s*$/i, "")
    .trim();

  return text.length > 0 ? text : null;
}

function mapLastFmTag(tag: Record<string, unknown>): LastFmArtistTag | null {
  const name = getNullableString(tag, "name");
  if (!name) {
    return null;
  }

  return {
    name,
    url: getNullableString(tag, "url"),
  };
}

function mapLastFmSimilarArtist(
  artist: Record<string, unknown>,
): LastFmSimilarArtist | null {
  const name = getNullableString(artist, "name");
  if (!name) {
    return null;
  }

  return {
    name,
    musicBrainzId: getNullableString(artist, "mbid"),
    url: getNullableString(artist, "url"),
  };
}

function mapLastFmSimilarArtists(value: unknown): LastFmSimilarArtist[] {
  return toRecordArray(value)
    .map(mapLastFmSimilarArtist)
    .filter(
      (artistMatch): artistMatch is LastFmSimilarArtist =>
        !!artistMatch && typeof artistMatch.name === "string",
    )
    .slice(0, LASTFM_SIMILAR_ARTIST_LIMIT);
}

function mapLastFmArtistMatch(
  artist: Record<string, unknown>,
  resolvedVia: "musicbrainz_id" | "artist_name",
  queriedMusicBrainzId: string | null,
): LastFmArtistMatch | null {
  const artistName = getNullableString(artist, "name");
  if (!artistName) {
    return null;
  }

  const statsRecord = isRecord(artist.stats) ? artist.stats : null;
  const bioRecord = isRecord(artist.bio) ? artist.bio : null;
  const tagsRecord = isRecord(artist.tags) ? artist.tags : null;
  const similarRecord = isRecord(artist.similar) ? artist.similar : null;
  const musicBrainzId =
    getNullableString(artist, "mbid") ?? queriedMusicBrainzId ?? null;

  return {
    artistName,
    musicBrainzId,
    resolvedVia,
    lastFmUrl: getNullableString(artist, "url"),
    stats: {
      listeners: statsRecord ? getNullableNumber(statsRecord, "listeners") : null,
      playcount: statsRecord ? getNullableNumber(statsRecord, "playcount") : null,
    },
    bio: {
      summary: bioRecord
        ? cleanBioSummary(getNullableString(bioRecord, "summary"))
        : null,
      published: bioRecord ? getNullableString(bioRecord, "published") : null,
    },
    topTags: tagsRecord
      ? toRecordArray(tagsRecord.tag)
          .map(mapLastFmTag)
          .filter(
            (tag): tag is LastFmArtistTag =>
              !!tag && typeof tag.name === "string",
          )
          .slice(0, LASTFM_TAG_LIMIT)
      : [],
    similarArtists: similarRecord
      ? toRecordArray(similarRecord.artist)
          .map(mapLastFmSimilarArtist)
          .filter(
            (artistMatch): artistMatch is LastFmSimilarArtist =>
              !!artistMatch && typeof artistMatch.name === "string",
          )
          .slice(0, LASTFM_SIMILAR_ARTIST_LIMIT)
      : [],
  };
}

function isLastFmNotFoundError(message: string) {
  const normalizedMessage = message.toLowerCase();
  return (
    normalizedMessage.includes("not found") ||
    normalizedMessage.includes("could not be found")
  );
}

async function fetchLastFmJson(
  apiKey: string,
  method: string,
  params: Record<string, string>,
): Promise<Record<string, unknown> | null> {
  const searchParams = new URLSearchParams({
    method,
    api_key: apiKey,
    format: "json",
    ...params,
  });
  const resource = `${LASTFM_API}?${searchParams.toString()}`;
  const startedAt = Date.now();
  const response = await fetch(resource, {
    headers: {
      Accept: "application/json",
      "User-Agent": LASTFM_USER_AGENT,
    },
  });

  logLastFmRequest({
    resource,
    status: response.status,
    durationMs: Date.now() - startedAt,
  });

  if (response.status === 404) {
    return null;
  }

  const text = await response.text();
  if (!response.ok) {
    throw new LastFmApiError(
      response.status,
      null,
      `Last.fm API error ${response.status}: ${text}`,
    );
  }

  if (!text) {
    return null;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new LastFmApiError(
      response.status,
      null,
      "Last.fm API returned invalid JSON.",
    );
  }

  if (!isRecord(payload)) {
    throw new LastFmApiError(
      response.status,
      null,
      "Last.fm API returned an invalid response.",
    );
  }

  const errorCode =
    typeof payload.error === "number" ? payload.error : null;
  const errorMessage =
    typeof payload.message === "string" ? payload.message : null;

  if (errorCode !== null) {
    if (errorMessage && isLastFmNotFoundError(errorMessage)) {
      return null;
    }

    throw new LastFmApiError(
      response.status,
      errorCode,
      errorMessage ?? `Last.fm API error ${errorCode}.`,
    );
  }

  return payload;
}

async function lookupArtist(
  apiKey: string,
  params: Record<string, string>,
  resolvedVia: "musicbrainz_id" | "artist_name",
  queriedMusicBrainzId: string | null,
): Promise<LastFmArtistMatch | null> {
  const infoPayload = await fetchLastFmJson(apiKey, "artist.getinfo", params);
  if (!infoPayload || !isRecord(infoPayload.artist)) {
    return null;
  }

  const match = mapLastFmArtistMatch(
    infoPayload.artist,
    resolvedVia,
    queriedMusicBrainzId,
  );
  if (!match) {
    return null;
  }

  const similarPayload = await fetchLastFmJson(apiKey, "artist.getsimilar", {
    ...params,
    limit: String(LASTFM_SIMILAR_ARTIST_LIMIT),
  });
  const similarArtists = isRecord(similarPayload?.similarartists)
    ? mapLastFmSimilarArtists(similarPayload.similarartists.artist)
    : [];

  return {
    ...match,
    similarArtists,
  };
}

export async function lookupArtistByMusicBrainzId(
  apiKey: string,
  musicBrainzId: string,
): Promise<LastFmArtistMatch | null> {
  const trimmedMusicBrainzId = musicBrainzId.trim();
  if (!trimmedMusicBrainzId) {
    return null;
  }

  return lookupArtist(
    apiKey,
    { mbid: trimmedMusicBrainzId },
    "musicbrainz_id",
    trimmedMusicBrainzId,
  );
}

export async function lookupArtistByName(
  apiKey: string,
  artistName: string,
): Promise<LastFmArtistMatch | null> {
  const trimmedArtistName = artistName.trim();
  if (!trimmedArtistName) {
    return null;
  }

  return lookupArtist(
    apiKey,
    {
      artist: trimmedArtistName,
      autocorrect: "1",
    },
    "artist_name",
    null,
  );
}
