import { useCallback, useEffect, useState } from "react";

import { useAppDataClient } from "@/data/client";
import type { ProfileData } from "@/data/profile";
import { useAppAuth } from "@/runtime/app-runtime";

interface UseProfileDataResult {
  data: ProfileData | null;
  loading: boolean;
  notFound: boolean;
}

function useProfileRequest(
  request: (() => Promise<ProfileData | null>) | null,
): UseProfileDataResult {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(() => !!request);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!request) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setNotFound(false);
    });

    request()
      .then((profile) => {
        if (cancelled) return;
        setData(profile);
        setNotFound(!profile);
      })
      .catch(() => {
        if (cancelled) return;
        setData(null);
        setNotFound(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [request]);

  if (!request) {
    return { data: null, loading: false, notFound: true };
  }

  return { data, loading, notFound };
}

export function useCurrentProfileData() {
  const client = useAppDataClient();
  const { session } = useAppAuth();
  const request = useCallback(
    () =>
      client.profile.getCurrent(
        session
          ? {
              userId: session.user.id,
              name: session.user.name,
              image: session.user.image ?? null,
            }
          : null,
      ),
    [client, session],
  );

  return useProfileRequest(request);
}

export function usePublicProfileData(userId: string) {
  const client = useAppDataClient();
  const request = useCallback(
    () => client.profile.getPublic(userId),
    [client, userId],
  );

  return useProfileRequest(userId ? request : null);
}
