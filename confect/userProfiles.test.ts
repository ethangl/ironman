import { describe, expect, it } from "vitest";

import { getAppUserProfileFromBetterAuthUser } from "./userProfiles";

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
});
