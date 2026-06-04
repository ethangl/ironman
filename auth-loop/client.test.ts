import { describe, expect, it } from "@effect/vitest";
import { Deferred, Effect, Fiber, Layer, Ref, TestClock } from "effect";

import { spotifyRequest, spotifyRequestOptional } from "./client";
import {
  CoalescerLive,
  CooldownInMemory,
  SpotifyHttp,
  type SpotifyResponse,
  TokenSource,
} from "./services";

const resp = (
  status: number,
  body = "",
  retryAfterSeconds: number | null = null,
): SpotifyResponse => ({
  status,
  ok: status >= 200 && status < 300,
  retryAfterSeconds,
  body,
});

/** Token source that never needs refreshing. */
const staticTokens = Layer.succeed(
  TokenSource,
  TokenSource.of({ get: Effect.succeed("tok"), refresh: Effect.succeed("tok") }),
);

/** Fake HTTP that replays a scripted queue of responses and counts calls. */
const queuedHttp = (calls: Ref.Ref<number>, queue: Ref.Ref<SpotifyResponse[]>) =>
  Layer.succeed(
    SpotifyHttp,
    SpotifyHttp.of({
      send: () =>
        Effect.gen(function* () {
          yield* Ref.update(calls, (n) => n + 1);
          const arr = yield* Ref.get(queue);
          yield* Ref.set(queue, arr.slice(1));
          return arr[0]!;
        }),
    }),
  );

describe("spotify auth loop", () => {
  it.effect("fails fast on a second request during an active 429 cooldown", () =>
    Effect.gen(function* () {
      const calls = yield* Ref.make(0);
      const http = Layer.succeed(
        SpotifyHttp,
        SpotifyHttp.of({
          send: () =>
            Ref.update(calls, (n) => n + 1).pipe(
              Effect.as(resp(429, "rate limited", 30)),
            ),
        }),
      );
      const layer = Layer.mergeAll(
        http,
        staticTokens,
        CooldownInMemory,
        CoalescerLive,
      );

      const [e1, e2] = yield* Effect.gen(function* () {
        const a = yield* spotifyRequest("/artists/a1").pipe(Effect.flip);
        const b = yield* spotifyRequest("/artists/a1").pipe(Effect.flip);
        return [a, b] as const;
      }).pipe(Effect.provide(layer));

      expect(e1).toMatchObject({
        _tag: "SpotifyRateLimited",
        retryAfterSeconds: 30,
      });
      expect(e2).toMatchObject({
        _tag: "SpotifyRateLimited",
        retryAfterSeconds: 30,
      });
      expect(yield* Ref.get(calls)).toBe(1);
    }),
  );

  it.effect("returns fallback for optional requests during a cooldown", () =>
    Effect.gen(function* () {
      const calls = yield* Ref.make(0);
      const http = Layer.succeed(
        SpotifyHttp,
        SpotifyHttp.of({
          send: () =>
            Ref.update(calls, (n) => n + 1).pipe(Effect.as(resp(429))),
        }),
      );
      const layer = Layer.mergeAll(
        http,
        staticTokens,
        CooldownInMemory,
        CoalescerLive,
      );

      const [r1, r2] = yield* Effect.gen(function* () {
        const a = yield* spotifyRequestOptional("/search?q=x", {
          tracks: [] as string[],
        });
        const b = yield* spotifyRequestOptional("/search?q=x", {
          tracks: [] as string[],
        });
        return [a, b] as const;
      }).pipe(Effect.provide(layer));

      expect(r1).toEqual({ tracks: [] });
      expect(r2).toEqual({ tracks: [] });
      expect(yield* Ref.get(calls)).toBe(1);
    }),
  );

  it.effect("allows requests again after the fallback cooldown expires", () =>
    Effect.gen(function* () {
      const calls = yield* Ref.make(0);
      const queue = yield* Ref.make<SpotifyResponse[]>([
        resp(429),
        resp(200, JSON.stringify({ country: "US" })),
      ]);
      const layer = Layer.mergeAll(
        queuedHttp(calls, queue),
        staticTokens,
        CooldownInMemory,
        CoalescerLive,
      );

      const result = yield* Effect.gen(function* () {
        const first = yield* spotifyRequest("/me").pipe(Effect.flip);
        yield* TestClock.adjust("5 seconds");
        const second = yield* spotifyRequest<{ country: string }>("/me");
        return { first, second };
      }).pipe(Effect.provide(layer));

      expect(result.first).toMatchObject({
        _tag: "SpotifyRateLimited",
        retryAfterSeconds: null,
      });
      expect(result.second).toEqual({ country: "US" });
      expect(yield* Ref.get(calls)).toBe(2);
    }),
  );

  it.effect("dedupes concurrent identical GET requests", () =>
    Effect.gen(function* () {
      const calls = yield* Ref.make(0);
      const gate = yield* Deferred.make<void>();
      const http = Layer.succeed(
        SpotifyHttp,
        SpotifyHttp.of({
          send: () =>
            Ref.update(calls, (n) => n + 1).pipe(
              Effect.zipRight(Deferred.await(gate)),
              Effect.as(resp(200, JSON.stringify({ country: "US" }))),
            ),
        }),
      );
      const layer = Layer.mergeAll(
        http,
        staticTokens,
        CooldownInMemory,
        CoalescerLive,
      );

      const results = yield* Effect.gen(function* () {
        const f1 = yield* Effect.fork(
          spotifyRequest<{ country: string }>("/me"),
        );
        const f2 = yield* Effect.fork(
          spotifyRequest<{ country: string }>("/me"),
        );
        yield* Effect.yieldNow();
        yield* Effect.yieldNow();
        yield* Deferred.succeed(gate, void 0);
        const r1 = yield* Fiber.join(f1);
        const r2 = yield* Fiber.join(f2);
        return [r1, r2] as const;
      }).pipe(Effect.provide(layer));

      expect(results[0]).toEqual({ country: "US" });
      expect(results[1]).toEqual({ country: "US" });
      expect(yield* Ref.get(calls)).toBe(1);
    }),
  );

  it.effect("issues a fresh GET after the previous identical one settles", () =>
    Effect.gen(function* () {
      const calls = yield* Ref.make(0);
      const queue = yield* Ref.make<SpotifyResponse[]>([
        resp(200, JSON.stringify({ country: "US" })),
        resp(200, JSON.stringify({ country: "CA" })),
      ]);
      const layer = Layer.mergeAll(
        queuedHttp(calls, queue),
        staticTokens,
        CooldownInMemory,
        CoalescerLive,
      );

      const out = yield* Effect.gen(function* () {
        const a = yield* spotifyRequest<{ country: string }>("/me");
        const b = yield* spotifyRequest<{ country: string }>("/me");
        return [a, b] as const;
      }).pipe(Effect.provide(layer));

      expect(out[0]).toEqual({ country: "US" });
      expect(out[1]).toEqual({ country: "CA" });
      expect(yield* Ref.get(calls)).toBe(2);
    }),
  );

  it.effect("refreshes the token once on 401 and retries", () =>
    Effect.gen(function* () {
      const calls = yield* Ref.make(0);
      const refreshes = yield* Ref.make(0);
      const token = yield* Ref.make("t1");
      const queue = yield* Ref.make<SpotifyResponse[]>([
        resp(401),
        resp(200, JSON.stringify({ country: "US" })),
      ]);
      const tokens = Layer.succeed(
        TokenSource,
        TokenSource.of({
          get: Ref.get(token),
          refresh: Ref.update(refreshes, (n) => n + 1).pipe(
            Effect.zipRight(Ref.set(token, "t2")),
            Effect.zipRight(Ref.get(token)),
          ),
        }),
      );
      const layer = Layer.mergeAll(
        queuedHttp(calls, queue),
        tokens,
        CooldownInMemory,
        CoalescerLive,
      );

      const result = yield* spotifyRequest<{ country: string }>("/me").pipe(
        Effect.provide(layer),
      );

      expect(result).toEqual({ country: "US" });
      expect(yield* Ref.get(calls)).toBe(2);
      expect(yield* Ref.get(refreshes)).toBe(1);
    }),
  );

  it.effect("retries transient 5xx with backoff, then succeeds", () =>
    Effect.gen(function* () {
      const calls = yield* Ref.make(0);
      const queue = yield* Ref.make<SpotifyResponse[]>([
        resp(503, "busy"),
        resp(503, "busy"),
        resp(200, JSON.stringify({ country: "US" })),
      ]);
      const layer = Layer.mergeAll(
        queuedHttp(calls, queue),
        staticTokens,
        CooldownInMemory,
        CoalescerLive,
      );

      const result = yield* Effect.gen(function* () {
        const fiber = yield* Effect.fork(
          spotifyRequest<{ country: string }>("/me"),
        );
        yield* TestClock.adjust("1 seconds");
        return yield* Fiber.join(fiber);
      }).pipe(Effect.provide(layer));

      expect(result).toEqual({ country: "US" });
      expect(yield* Ref.get(calls)).toBe(3);
    }),
  );
});
