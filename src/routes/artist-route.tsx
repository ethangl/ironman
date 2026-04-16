import { useParams } from "react-router-dom";

import { AlbumArt } from "@/components/album-art";

import { Spinner } from "@/components/ui/spinner";
import { useArtistPageData } from "@/features/artist";
import { Releases } from "@/features/spotify/activity/releases";
import { Tracks } from "@/features/spotify/activity/tracks";

export function ArtistRoute() {
  const { artistId = "" } = useParams();
  const { data, loading, error, notFound } = useArtistPageData(artistId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner className="h-8 w-8 border-mist-500 border-t-white" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="py-32 text-center text-muted-foreground">
        Artist not found.
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-32 text-center text-muted-foreground">
        {error ?? "Could not load artist details."}
      </div>
    );
  }

  const { artist, albums, singles, topTracks } = data;

  return (
    <main className="gap-3 grid md:grid-cols-2 items-start m-3 max-w-none p-0">
      <section className="col-span-full rounded-3xl bg-white/5 p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <AlbumArt
            src={artist.image}
            className="size-32 rounded-3xl sm:size-40"
          />
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            {artist.name}
          </h1>
        </div>
      </section>
      <div className="flex flex-col gap-3">
        <Tracks title="Top Tracks" tracks={topTracks} />
        <Releases title="Singles" releases={singles} />
      </div>
      <Releases title="Albums" releases={albums} />
    </main>
  );
}
