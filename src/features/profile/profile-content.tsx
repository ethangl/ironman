import { Avatar } from "@/components/avatar";
import { LogoutButton } from "@/features/auth";
import type { ProfileData } from "@shared/profile-data";

export function ProfileContent({
  data,
  showLogout = false,
}: {
  data: ProfileData;
  showLogout?: boolean;
}) {
  return (
    <main className="space-y-8">
      <header className="flex items-center gap-4">
        <Avatar
          id={data.user.id}
          image={data.user.image}
          name={data.user.name}
        />
        <div className="flex-auto space-y-1">
          <h1 className="text-2xl font-bold">{data.user.name}</h1>
        </div>
        {showLogout ? <LogoutButton /> : null}
      </header>
    </main>
  );
}
