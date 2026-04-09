import type { ProfileData } from "@/frontend/profile/profile-view";

import { requestOptionalJson } from "@/data/http";

export function getProfile() {
  return requestOptionalJson<ProfileData>(
    "/api/profile",
    undefined,
    { fallbackMessage: "Could not load your profile." },
  );
}

export function getPublicProfile(userId: string) {
  return requestOptionalJson<ProfileData>(
    `/api/profile/${userId}`,
    undefined,
    { fallbackMessage: "Could not load this profile." },
  );
}
