import { afterEach, describe, expect, it, vi } from "vitest";

import { playUri } from "./playback";

function createResponse({
  headers,
  ok,
  status,
}: {
  headers?: Record<string, string>;
  ok: boolean;
  status: number;
}) {
  return {
    headers: {
      get(name: string) {
        return headers?.[name.toLowerCase()] ?? headers?.[name] ?? null;
      },
    },
    ok,
    status,
  } as unknown as Response;
}

describe("playUri", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends position_ms when an offset is provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createResponse({
        ok: true,
        status: 204,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      playUri("spotify:track:track-1", "spotify-token", "device-1", 12_345.67),
    ).resolves.toEqual({
      ok: true,
      status: 204,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.spotify.com/v1/me/player/play?device_id=device-1",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          Authorization: "Bearer spotify-token",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          uris: ["spotify:track:track-1"],
          position_ms: 12_345,
        }),
      }),
    );
  });

  it("omits position_ms when no finite offset is provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createResponse({
        ok: true,
        status: 204,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await playUri(
      "spotify:track:track-1",
      "spotify-token",
      undefined,
      Number.NaN,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.spotify.com/v1/me/player/play",
      expect.objectContaining({
        body: JSON.stringify({
          uris: ["spotify:track:track-1"],
        }),
      }),
    );
  });
});
