import { LoadMoreButton } from "@/components/load-more-button";
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
import { SpotifyHeader } from "../spotify-shell/spotify-header";
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
      <SpotifyHeader href="/home" title={artist.name} />
      <SidebarContent>
        <Tracks title="Top Tracks" tracks={topTracks} />
        <Releases
          title="Singles"
          page={singles}
          paginate={
            singles.hasMore && (
              <LoadMoreButton
                disabled={loadingReleaseGroups.single}
                loading={loadingReleaseGroups.single}
                onClick={() => void loadMoreReleases("single")}
              />
            )
          }
        />
        <Releases
          title="Albums"
          page={albums}
          paginate={
            albums.hasMore && (
              <LoadMoreButton
                disabled={loadingReleaseGroups.album}
                loading={loadingReleaseGroups.album}
                onClick={() => void loadMoreReleases("album")}
              />
            )
          }
        />
        <ArtistLastFmOverview artist={lastFmArtist} />
        <ArtistSimilar similarArtists={lastFmArtist?.similarArtists || []} />
        <ArtistExternalLinks links={musicBrainzArtist?.links ?? null} />
      </SidebarContent>
    </>
  );
};
