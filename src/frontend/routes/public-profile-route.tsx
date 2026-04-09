import { useParams } from "react-router-dom";

import { ProfileView } from "@/frontend/profile/profile-view";
import { usePublicProfileData } from "@/hooks/use-profile-data";

export function PublicProfileRoute() {
  const { userId = "" } = useParams();
  const { data, loading, notFound } = usePublicProfileData(userId);

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
