"use client";

import { useEffect, useState } from "react";

import {
  ProfileView,
  type ProfileData,
} from "@/app/profile/[userId]/profile-view";

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/profile")
      .then(async (r) => {
        if (!r.ok) return null;
        return (await r.json()) as ProfileData;
      })
      .then((profile) => {
        if (cancelled) return;
        setData(profile);
      })
      .catch(() => {
        if (cancelled) return;
        setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-mist-500 border-t-white" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-32 text-center text-muted-foreground">
        Sign in to see your profile.
      </div>
    );
  }

  return <ProfileView data={data} />;
}
