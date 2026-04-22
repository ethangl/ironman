import { SidebarContent } from "@/components/sidebar";
import {
  ArtistExternalLinks,
  ArtistLastFmOverview,
  Releases,
  useLastFmArtist,
  useMusicBrainzArtist,
} from "@/features/artist";
import type {
  SpotifyArtistPageData,
  SpotifyArtistReleaseGroup,
} from "@/features/spotify-client/types";
import { Tracks } from "@/features/spotify-tracks";
import { FC } from "react";
import { ArtistSimilar } from "./artist-similar";

type ReleaseLoadingState = Record<SpotifyArtistReleaseGroup, boolean>;

export type ArtistProps = {
  artistData: SpotifyArtistPageData;
  loadMoreReleases: (includeGroups: SpotifyArtistReleaseGroup) => Promise<void>;
  loadingReleaseGroups: ReleaseLoadingState;
};

export const Artist: FC<ArtistProps> = ({
  artistData,
  loadMoreReleases,
  loadingReleaseGroups,
}) => {
  const musicBrainzArtist = useMusicBrainzArtist(artistData.artist.id);
  const lastFmArtist = useLastFmArtist({
    artistName: artistData.artist.name ?? "",
    musicBrainzId: musicBrainzArtist?.artist.id ?? null,
  });

  const { albums, singles, topTracks } = artistData;

  return (
    <SidebarContent>
      <Tracks title="Top Tracks" tracks={topTracks} />
      <Releases
        title="Singles"
        page={singles}
        loadingMore={loadingReleaseGroups.single}
        onLoadMore={() => loadMoreReleases("single")}
      />
      <Releases
        title="Albums"
        page={albums}
        loadingMore={loadingReleaseGroups.album}
        onLoadMore={() => loadMoreReleases("album")}
      />
      <ArtistLastFmOverview artist={lastFmArtist} />
      <ArtistSimilar similarArtists={lastFmArtist?.similarArtists || []} />
      <ArtistExternalLinks links={musicBrainzArtist?.links ?? null} />
    </SidebarContent>
  );
};
