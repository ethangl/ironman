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

export interface MusicBrainzArtistMatch {
  spotifyArtistId: string;
  spotifyUrl: string;
  resolvedVia: "spotify_url";
  matchCount: number;
  artist: MusicBrainzArtist;
  links: MusicBrainzArtistLinks;
}

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
