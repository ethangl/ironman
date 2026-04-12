import type { ProfileData } from "@shared/profile-data";
import { api } from "@api";
import { useAppAuth } from "@/app";
import { useStableQuery } from "@/hooks/use-stable-query";

interface UseProfileDataResult {
  data: ProfileData | null;
  loading: boolean;
  notFound: boolean;
}

export function useCurrentProfileData() {
  const { session } = useAppAuth();
  const profile = useStableQuery(
    api.profile.get,
    session
      ? {
          userId: session.user.id,
          fallbackName: session.user.name,
          fallbackImage: session.user.image ?? undefined,
        }
      : "skip",
  );

  if (!session) {
    return { data: null, loading: false, notFound: false };
  }

  return {
    data: (profile as ProfileData | null | undefined) ?? null,
    loading: profile === undefined,
    notFound: profile === null,
  } satisfies UseProfileDataResult;
}

export function usePublicProfileData(userId: string) {
  const profile = useStableQuery(
    api.profile.get,
    userId ? { userId } : "skip",
  );

  if (!userId) {
    return { data: null, loading: false, notFound: true };
  }

  return {
    data: (profile as ProfileData | null | undefined) ?? null,
    loading: profile === undefined,
    notFound: profile === null,
  } satisfies UseProfileDataResult;
}
