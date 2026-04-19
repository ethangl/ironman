import { MusicBrainzApiError } from "./errors";

const MUSICBRAINZ_API = "https://musicbrainz.org/ws/2";
const MUSICBRAINZ_USER_AGENT =
  "rooms/0.1.0 (MusicBrainz artist enrichment lookup)";

export interface MusicBrainzArtist {
  id: string;
  name: string;
  sortName: string | null;
  type: string | null;
  country: string | null;
  disambiguation: string | null;
  spotifyUrl: string;
  musicBrainzUrl: string;
}

export interface MusicBrainzArtistLinks {
  homepage: string | null;
  instagram: string | null;
  youtube: string | null;
  bandcamp: string | null;
}

export interface MusicBrainzArtistLookup {
  spotifyArtistId: string;
  spotifyUrl: string;
  resolvedVia: "spotify_url";
  matchCount: number;
  artist: MusicBrainzArtist;
}

function logMusicBrainzRequest(details: {
  resource: string;
  status: number;
  durationMs: number;
}) {
  if (process.env.NODE_ENV === "test") return;

  console.info(
    `[musicbrainz] GET ${details.resource} status=${details.status} duration=${details.durationMs}ms`,
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

function isMusicBrainzArtistRecord(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.id === "string" && typeof value.name === "string";
}

function isMusicBrainzUrlRelationRecord(
  value: unknown,
): value is Record<string, unknown> {
  if (!isRecord(value) || typeof value.type !== "string") {
    return false;
  }

  return isRecord(value.url) && typeof value.url.resource === "string";
}

function getSpotifyArtistUrl(spotifyArtistId: string) {
  return `https://open.spotify.com/artist/${encodeURIComponent(spotifyArtistId)}`;
}

function getEmptyArtistLinks(): MusicBrainzArtistLinks {
  return {
    homepage: null,
    instagram: null,
    youtube: null,
    bandcamp: null,
  };
}

function hasHostname(resource: string, hostname: string) {
  try {
    const url = new URL(resource);
    const normalizedHostname = url.hostname.toLowerCase();
    return (
      normalizedHostname === hostname ||
      normalizedHostname.endsWith(`.${hostname}`)
    );
  } catch {
    return false;
  }
}

function getSpotifyArtistIdFromResource(resource: string) {
  try {
    const url = new URL(resource);
    const normalizedHostname = url.hostname.toLowerCase();
    if (
      normalizedHostname !== "open.spotify.com" &&
      !normalizedHostname.endsWith(".open.spotify.com")
    ) {
      return null;
    }

    const [entityType, spotifyArtistId] = url.pathname
      .split("/")
      .filter((segment) => segment.length > 0);
    if (entityType !== "artist" || !spotifyArtistId) {
      return null;
    }

    return spotifyArtistId;
  } catch {
    return null;
  }
}

function mapMusicBrainzArtist(
  artist: Record<string, unknown>,
  spotifyUrl: string,
): MusicBrainzArtist {
  return {
    id: artist.id as string,
    name: artist.name as string,
    sortName: getNullableString(artist, "sort-name"),
    type: getNullableString(artist, "type"),
    country: getNullableString(artist, "country"),
    disambiguation: getNullableString(artist, "disambiguation"),
    spotifyUrl,
    musicBrainzUrl: `https://musicbrainz.org/artist/${artist.id as string}`,
  };
}

function mapMusicBrainzArtistLinks(
  relations: Record<string, unknown>[],
): MusicBrainzArtistLinks {
  const urlRelations = relations
    .filter(isMusicBrainzUrlRelationRecord)
    .map((relation) => ({
      type: relation.type as string,
      resource: (relation.url as { resource: string }).resource,
    }));

  return {
    homepage:
      urlRelations.find((relation) => relation.type === "official homepage")
        ?.resource ?? null,
    instagram:
      urlRelations.find(
        (relation) =>
          relation.type === "social network" &&
          hasHostname(relation.resource, "instagram.com"),
      )?.resource ?? null,
    youtube:
      urlRelations.find(
        (relation) =>
          relation.type === "youtube" ||
          hasHostname(relation.resource, "youtube.com") ||
          hasHostname(relation.resource, "youtu.be"),
      )?.resource ?? null,
    bandcamp:
      urlRelations.find(
        (relation) =>
          relation.type === "bandcamp" ||
          hasHostname(relation.resource, "bandcamp.com"),
      )?.resource ?? null,
  };
}

async function fetchMusicBrainzJson(
  path: string,
  resource: string,
): Promise<Record<string, unknown> | null> {
  const startedAt = Date.now();
  const response = await fetch(`${MUSICBRAINZ_API}${path}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": MUSICBRAINZ_USER_AGENT,
    },
  });

  logMusicBrainzRequest({
    resource,
    status: response.status,
    durationMs: Date.now() - startedAt,
  });

  if (response.status === 404) {
    return null;
  }

  const text = await response.text();
  if (!response.ok) {
    throw new MusicBrainzApiError(
      response.status,
      `MusicBrainz API error ${response.status}: ${text}`,
    );
  }

  if (!text) {
    return null;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new MusicBrainzApiError(
      response.status,
      "MusicBrainz API returned invalid JSON.",
    );
  }

  if (!isRecord(payload)) {
    throw new MusicBrainzApiError(
      response.status,
      "MusicBrainz API returned an invalid response.",
    );
  }

  return payload;
}

async function fetchArtistRelationsByArtistId(
  musicBrainzArtistId: string,
): Promise<Record<string, unknown>[] | null> {
  const payload = await fetchMusicBrainzJson(
    `/artist/${encodeURIComponent(musicBrainzArtistId)}?inc=url-rels&fmt=json`,
    `artist/${musicBrainzArtistId}`,
  );
  if (!payload) {
    return null;
  }

  return Array.isArray(payload.relations) ? payload.relations.filter(isRecord) : [];
}

export async function lookupArtistBySpotifyId(
  spotifyArtistId: string,
): Promise<MusicBrainzArtistLookup | null> {
  const spotifyUrl = getSpotifyArtistUrl(spotifyArtistId);
  const params = new URLSearchParams({
    resource: spotifyUrl,
    inc: "artist-rels",
    fmt: "json",
  });
  const payload = await fetchMusicBrainzJson(
    `/url?${params.toString()}`,
    spotifyUrl,
  );
  if (!payload) {
    return null;
  }

  const relations = Array.isArray(payload.relations) ? payload.relations : [];
  const artists = relations
    .filter(isRecord)
    .filter((relation) => relation["target-type"] === "artist")
    .map((relation) => relation.artist)
    .filter(isMusicBrainzArtistRecord)
    .map((artist) => mapMusicBrainzArtist(artist, spotifyUrl));

  if (artists.length === 0) {
    return null;
  }

  return {
    spotifyArtistId,
    spotifyUrl,
    resolvedVia: "spotify_url",
    matchCount: artists.length,
    artist: artists[0],
  };
}

export async function lookupArtistLinksByArtistId(
  musicBrainzArtistId: string,
): Promise<MusicBrainzArtistLinks> {
  const relations = await fetchArtistRelationsByArtistId(musicBrainzArtistId);
  if (!relations) {
    return getEmptyArtistLinks();
  }

  return mapMusicBrainzArtistLinks(relations);
}

export async function lookupSpotifyArtistIdByMusicBrainzArtistId(
  musicBrainzArtistId: string,
): Promise<string | null> {
  const relations = await fetchArtistRelationsByArtistId(musicBrainzArtistId);
  if (!relations) {
    return null;
  }

  for (const relation of relations) {
    if (!isMusicBrainzUrlRelationRecord(relation)) {
      continue;
    }

    const spotifyArtistId = getSpotifyArtistIdFromResource(
      (relation.url as { resource: string }).resource,
    );
    if (spotifyArtistId) {
      return spotifyArtistId;
    }
  }

  return null;
}
