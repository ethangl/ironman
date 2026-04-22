import { SidebarContent } from "@/components/sidebar";
import {
  ArtistExternalLinks,
  ArtistLastFmOverview,
  Releases,
  useLastFmArtist,
  useMusicBrainzArtist,
} from "@/features/artist";
import { SpotifyArtistPageData } from "@/features/spotify-client/types";
import { Tracks } from "@/features/spotify-tracks";
import { FC } from "react";
import { ArtistSimilar } from "./artist-similar";

export type ArtistProps = { artistData: SpotifyArtistPageData };

export const Artist: FC<ArtistProps> = ({ artistData }) => {
  const musicBrainzArtist = useMusicBrainzArtist(artistData.artist.id);
  const lastFmArtist = useLastFmArtist({
    artistName: artistData.artist.name ?? "",
    musicBrainzId: musicBrainzArtist?.artist.id ?? null,
  });

  const { albums, singles, topTracks } = artistData;

  return (
    <SidebarContent>
      <Tracks title="Top Tracks" tracks={topTracks} />
      <Releases title="Singles" releases={singles} />
      <Releases title="Albums" releases={albums} />
      <ArtistLastFmOverview artist={lastFmArtist} />
      <ArtistSimilar similarArtists={lastFmArtist?.similarArtists || []} />
      <ArtistExternalLinks links={musicBrainzArtist?.links ?? null} />
    </SidebarContent>
  );
};
