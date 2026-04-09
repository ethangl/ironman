const DEV_TTL_MS = 10_000;

export function spotifyCacheTtl(prodTtlMs: number) {
  return process.env.NODE_ENV === "development" ? DEV_TTL_MS : prodTtlMs;
}
