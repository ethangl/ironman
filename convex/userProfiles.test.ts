import { describe, expect, it, vi } from "vitest";

import {
  getAppUserProfileFromBetterAuthUser,
  upsertAppUserProfile,
} from "./userProfiles";

describe("convex/userProfiles", () => {
  it("maps Better Auth users onto app user profiles", () => {
    expect(
      getAppUserProfileFromBetterAuthUser({
        _id: "auth-user-1",
        name: "  Ethan  ",
        image: "https://example.com/avatar.png",
      }),
    ).toEqual({
      userId: "auth-user-1",
      name: "Ethan",
      image: "https://example.com/avatar.png",
    });

    expect(
      getAppUserProfileFromBetterAuthUser({
        _id: "ignored-auth-id",
        userId: "legacy-user-id",
        name: "",
        image: null,
      }),
    ).toEqual({
      userId: "legacy-user-id",
      name: "legacy-user-id",
      image: undefined,
    });
  });

  it("upserts into the app users table by userId", async () => {
    const unique = vi
      .fn()
      .mockResolvedValueOnce({ _id: "existing-user-doc" })
      .mockResolvedValueOnce(null);
    const eq = vi.fn().mockReturnValue({ unique });
    const withIndex = vi.fn((_indexName, applyIndex) => {
      applyIndex({ eq });
      return { unique };
    });
    const query = vi.fn(() => ({ withIndex }));
    const patch = vi.fn().mockResolvedValue(undefined);
    const insert = vi.fn().mockResolvedValue("new-user-doc");

    const ctx = {
      db: {
        query,
        patch,
        insert,
      },
    };

    await expect(
      upsertAppUserProfile(ctx as never, {
        userId: "user-1",
        name: "Ethan",
        image: "https://example.com/ethan.png",
      }),
    ).resolves.toBe("existing-user-doc");

    expect(patch).toHaveBeenCalledWith("existing-user-doc", {
      userId: "user-1",
      name: "Ethan",
      image: "https://example.com/ethan.png",
    });

    await expect(
      upsertAppUserProfile(ctx as never, {
        userId: "user-2",
        name: "Case",
        image: undefined,
      }),
    ).resolves.toBe("new-user-doc");

    expect(insert).toHaveBeenCalledWith("users", {
      userId: "user-2",
      name: "Case",
      image: undefined,
    });
  });
});
