"use client";

import { use, useEffect, useState } from "react";

import { ProfileView, type ProfileData } from "./profile-view";

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);

  return <PublicProfilePageBody key={userId} userId={userId} />;
}

function PublicProfilePageBody({ userId }: { userId: string }) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/profile/${userId}`)
      .then((r) => {
        if (!r.ok && r.status !== 404) {
          return null;
        }
        if (r.status === 404) {
          if (!cancelled) setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!cancelled && d) setData(d);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-mist-500 border-t-white" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="py-32 text-center text-muted-foreground">
        User not found.
      </div>
    );
  }

  return (
    <main>
      <ProfileView data={data} />
    </main>
  );
}
