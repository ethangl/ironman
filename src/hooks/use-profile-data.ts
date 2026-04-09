import { useEffect, useState } from "react";

import { useAppDataClient } from "@/data/client";
import type { ProfileData } from "@/frontend/profile/profile-view";

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
  return useProfileRequest(client.profile.getCurrent);
}

export function usePublicProfileData(userId: string) {
  const client = useAppDataClient();
  return useProfileRequest(
    userId ? () => client.profile.getPublic(userId) : null,
  );
}
