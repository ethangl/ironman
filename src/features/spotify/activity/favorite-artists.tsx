import { FC } from "react";

import { AppLink } from "@/components/app-link";
import { Section } from "@/components/section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Thumbnail } from "./thumbnail";
import { useSpotifyActivity } from "./use-spotify-activity";

export const FavoriteArtists: FC = () => {
  const { favoriteArtists } = useSpotifyActivity();

  if (favoriteArtists.length === 0) return null;

  return (
    <Section title="Your Favorite Artists" color="--color-emerald-400">
      <ScrollArea>
        <ol className="flex gap-4 p-4 w-max">
          {favoriteArtists.map((artist) => (
            <li key={artist.id}>
              <AppLink href={`/artist/${artist.id}`}>
                <Thumbnail name={artist.name} src={artist.image} />
              </AppLink>
            </li>
          ))}
        </ol>
      </ScrollArea>
    </Section>
  );
};
