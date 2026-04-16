import { describe, expect, it } from "vitest";

import {
  normalizeTrackAudioFeaturesResponse,
  parseSpotifyTrackIdFromHref,
  uniqueTrackIds,
} from "./reccobeats";

describe("reccobeats helpers", () => {
  it("normalizes audio features for requested Spotify track ids", () => {
    const fetchedAt = 1_234_567;
    const result = normalizeTrackAudioFeaturesResponse({
      requestedTrackIds: ["track-1", "track-2"],
      fetchedAt,
      response: {
        content: [
          {
            href: "https://open.spotify.com/track/track-1",
            isrc: "isrc-1",
            acousticness: 0.1,
            danceability: 0.2,
            energy: 0.3,
            instrumentalness: 0.4,
            key: 5,
            liveness: 0.6,
            loudness: -7.5,
            mode: 1,
            speechiness: 0.7,
            tempo: 120.5,
            valence: 0.8,
          },
        ],
      },
    });

    expect(result.records).toEqual([
      {
        spotifyTrackId: "track-1",
        isrc: "isrc-1",
        acousticness: 0.1,
        danceability: 0.2,
        energy: 0.3,
        instrumentalness: 0.4,
        key: 5,
        liveness: 0.6,
        loudness: -7.5,
        mode: 1,
        speechiness: 0.7,
        tempo: 120.5,
        valence: 0.8,
        fetchedAt,
      },
    ]);
    expect(result.missingTrackIds).toEqual(["track-2"]);
  });

  it("deduplicates requested track ids", () => {
    expect(uniqueTrackIds([" track-1 ", "track-1", "", "track-2"])).toEqual([
      "track-1",
      "track-2",
    ]);
  });

  it("parses the spotify track id from a spotify track href", () => {
    expect(
      parseSpotifyTrackIdFromHref(
        "https://open.spotify.com/track/7s25THrKz86DM225dOYwnr?si=123",
      ),
    ).toBe("7s25THrKz86DM225dOYwnr");
  });

  it("throws when the response shape is invalid", () => {
    expect(() =>
      normalizeTrackAudioFeaturesResponse({
        requestedTrackIds: ["track-1"],
        fetchedAt: 1,
        response: { content: [{ href: "https://open.spotify.com/track/track-1" }] },
      }),
    ).toThrow("Invalid ReccoBeats audio features item.");
  });
});
