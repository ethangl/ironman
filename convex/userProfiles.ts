import type { MutationCtx } from "./_generated/server";

export type AppUserProfile = {
  userId: string;
  name: string;
  image?: string;
};

type BetterAuthUserDoc = {
  _id?: string | null;
  id?: string | null;
  userId?: string | null;
  name?: string | null;
  image?: string | null;
};

function normalizeUserId(user: BetterAuthUserDoc) {
  const userId =
    typeof user.userId === "string" && user.userId.length > 0
      ? user.userId
      : typeof user._id === "string" && user._id.length > 0
        ? user._id
        : typeof user.id === "string" && user.id.length > 0
          ? user.id
          : null;

  if (!userId) {
    throw new Error("Missing Better Auth user id.");
  }

  return userId;
}

function normalizeName(name: string | null | undefined, fallbackUserId: string) {
  if (typeof name === "string") {
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  return fallbackUserId;
}

function normalizeImage(image: string | null | undefined) {
  return typeof image === "string" && image.length > 0 ? image : undefined;
}

export function getAppUserProfileFromBetterAuthUser(
  user: BetterAuthUserDoc,
): AppUserProfile {
  const userId = normalizeUserId(user);

  return {
    userId,
    name: normalizeName(user.name, userId),
    image: normalizeImage(user.image),
  };
}

export async function upsertAppUserProfile(
  ctx: Pick<MutationCtx, "db">,
  profile: AppUserProfile,
) {
  const existing = await ctx.db
    .query("users")
    .withIndex("by_userId", (q) => q.eq("userId", profile.userId))
    .unique();

  const payload = {
    userId: profile.userId,
    name: profile.name,
    image: profile.image,
  };

  if (existing) {
    await ctx.db.patch(existing._id, payload);
    return existing._id;
  }

  return await ctx.db.insert("users", payload);
}
