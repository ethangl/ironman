import { useAppCapabilities } from "@/app";
import { Spinner } from "@/components/ui/spinner";
import { SpotifyActivity } from "@/features/spotify/activity/spotify-activity";

export function AuthedHomeRoute() {
  const { canBrowsePersonalSpotify } = useAppCapabilities();

  return canBrowsePersonalSpotify ? <SpotifyActivity /> : <Spinner />;
}
