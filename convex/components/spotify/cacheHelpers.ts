import type { ActionCtx } from "./_generated/server";
import { api } from "./_generated/api";

export async function getCachedValue<T>(
  ctx: ActionCtx,
  key: string,
): Promise<T | null> {
  const entry = await ctx.runQuery(api.cache.get, { key });
  if (!entry) {
    return null;
  }

  return JSON.parse(entry.value) as T;
}

export async function setCachedValue(
  ctx: ActionCtx,
  key: string,
  value: unknown,
  ttlMs: number,
) {
  await ctx.runMutation(api.cache.set, {
    key,
    value: JSON.stringify(value),
    expiresAt: Date.now() + ttlMs,
  });
}
