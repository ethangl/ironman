import { FC } from "react";

import { AppLink } from "@/components/app-link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Thumbnail } from "@/frontend/home/thumbnail";
import { useSpotifyActivity } from "@/hooks/use-spotify-activity";

export const FavoriteArtists: FC = () => {
  const { favoriteArtists } = useSpotifyActivity();

  if (favoriteArtists.length === 0) return null;

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold">Favorite Artists</h3>
      <ScrollArea>
        <ol className="flex w-max gap-2">
          {favoriteArtists.map((artist) => (
            <li key={artist.id}>
              <AppLink href={`/artist/${artist.id}`}>
                <Thumbnail name={artist.name} src={artist.image} />
              </AppLink>
            </li>
          ))}
        </ol>
      </ScrollArea>
    </section>
  );
};
