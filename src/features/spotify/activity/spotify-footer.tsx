import { AppLink } from "@/components/app-link";
import { Avatar } from "@/components/avatar";
import { Section } from "@/components/section";
import { useAppAuth, useAppCapabilities } from "../../../app/app-runtime";
import { ClearSpotifyCacheButton } from "../../../app/clear-spotify-cache-button";

export function SpotifyFooter() {
  const { session } = useAppAuth();
  const { canBrowsePersonalSpotify } = useAppCapabilities();

  if (!session || !canBrowsePersonalSpotify) {
    return null;
  }

  if (canBrowsePersonalSpotify) {
    return (
      <Section className="flex flex-none gap-2 h-14 items-center justify-between px-4">
        <ClearSpotifyCacheButton />
        <AppLink
          href="/profile"
          className="inline-flex gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <Avatar
            id={session.user.id}
            image={session.user.image || null}
            name={session.user.name}
            sizeClassName="size-8 text-xl"
          />
        </AppLink>
      </Section>
    );
  }
}
