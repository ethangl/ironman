import Link from "next/link";
import { FC } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useSpotifyActivity } from "@/hooks/use-spotify-activity";
import { Thumbnail } from "./thumbnail";

export const FavoriteArtists: FC = () => {
  const { favoriteArtists } = useSpotifyActivity();

  if (favoriteArtists.length === 0) return null;

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold">Favorite Artists</h3>
      <ScrollArea>
        <ol className="flex gap-2 w-max">
          {favoriteArtists.map((artist) => (
            <li key={artist.id}>
              <Link href={`/artist/${artist.id}`}>
                <Thumbnail name={artist.name} src={artist.image} />
              </Link>
            </li>
          ))}
        </ol>
      </ScrollArea>
    </section>
  );
};
