import { ProfileContent, useCurrentProfileData } from "@/features/profile";

export function ProfileRoute() {
  const { data, loading } = useCurrentProfileData();

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

  return <ProfileContent data={data} showLogout />;
}
