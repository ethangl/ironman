import { FC } from "react";

import { AppLink } from "@/components/app-link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Thumbnail } from "@/frontend/home/thumbnail";
import { useSpotifyActivity } from "@/hooks/use-spotify-activity";

export const FavoriteArtists: FC = () => {
  const { favoriteArtists } = useSpotifyActivity();

  if (favoriteArtists.length === 0) return null;

  return (
    <section className="-mx-6 space-y-4">
      <h3 className="mx-6 text-lg font-bold">Favorite Artists</h3>
      <ScrollArea>
        <ol className="flex gap-2 px-3 w-max">
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
