import { useParams } from "react-router-dom";

import { Section, SectionHeader } from "@/components/section";
import { Spinner } from "@/components/ui/spinner";
import {
  ArtistExternalLinks,
  ArtistLastFmOverview,
  useArtistPageData,
  useLastFmArtist,
  useMusicBrainzArtist,
} from "@/features/artist";
import { Releases } from "@/features/spotify/activity/releases";
import { Tracks } from "@/features/spotify/activity/tracks";
import { Dither, ImageTexture, Shader } from "shaders/react";

export function ArtistRoute() {
  const { artistId = "" } = useParams();
  const { data, loading, error, notFound } = useArtistPageData(artistId);
  const musicBrainzArtist = useMusicBrainzArtist(artistId);
  const lastFmArtist = useLastFmArtist({
    artistName: data?.artist.name ?? "",
    musicBrainzId: musicBrainzArtist?.artist.id ?? null,
  });

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
    <>
      <Section className="relative self-stretch">
        <SectionHeader title={artist.name} />
        {artist.image && (
          <div className="absolute inset-0 mix-blend-overlay opacity-33 overflow-hidden rounded-3xl size-full">
            <Shader className="absolute inset-0">
              <Dither colorMode="source" pattern="blueNoise" pixelSize={1}>
                <ImageTexture url={artist.image} />
              </Dither>
            </Shader>
          </div>
        )}
        <div className="relative p-4">
          <ArtistExternalLinks links={musicBrainzArtist?.links ?? null} />
        </div>

        {lastFmArtist && <ArtistLastFmOverview artist={lastFmArtist} />}
      </Section>

      <Tracks title="Top Tracks" tracks={topTracks} />
      <Releases title="Singles" releases={singles} />
      <Releases title="Albums" releases={albums} />
    </>
  );
}
