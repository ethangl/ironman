import { SidebarContent } from "@/components/sidebar";
import {
  ArtistExternalLinks,
  ArtistLastFmOverview,
  Releases,
  useLastFmArtist,
  useMusicBrainzArtist,
} from "@/features/artist";
import { Tracks } from "@/features/spotify-tracks";
import { FC } from "react";
import { ArtistHeader } from "./artist-header";
import { useArtist } from "./artist-provider";
import { ArtistSimilar } from "./artist-similar";

export const Artist: FC = () => {
  const {
    data: { artist, albums, singles, topTracks },
    loadMoreReleases,
    loadingReleaseGroups,
  } = useArtist();

  const musicBrainzArtist = useMusicBrainzArtist(artist.id);

  const lastFmArtist = useLastFmArtist({
    artistName: artist.name ?? "",
    musicBrainzId: musicBrainzArtist?.artist.id ?? null,
  });

  return (
    <>
      <ArtistHeader href="/home" title={artist.name} />
      <SidebarContent>
        <Tracks title="Top Tracks" tracks={topTracks} />
        <Releases
          title="Singles"
          page={singles}
          loadingMore={loadingReleaseGroups.single}
          onLoadMore={async () => await loadMoreReleases("single")}
        />
        <Releases
          title="Albums"
          page={albums}
          loadingMore={loadingReleaseGroups.album}
          onLoadMore={async () => await loadMoreReleases("album")}
        />
        <ArtistLastFmOverview artist={lastFmArtist} />
        <ArtistSimilar similarArtists={lastFmArtist?.similarArtists || []} />
        <ArtistExternalLinks links={musicBrainzArtist?.links ?? null} />
      </SidebarContent>
    </>
  );
};
