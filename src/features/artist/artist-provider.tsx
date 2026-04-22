import { CircleQuestionMarkIcon } from "lucide-react";
import { createContext, useContext, type ReactNode } from "react";
import { useParams } from "react-router-dom";

import { SectionContent } from "@/components/section";
import { SidebarContent } from "@/components/sidebar";
import { Spinner } from "@/components/ui/spinner";
import type {
  SpotifyArtistPageData,
  SpotifyArtistReleaseGroup,
} from "@/features/spotify-client/types";
import { ArtistError } from "./artist-error";
import { ArtistHeader } from "./artist-header";
import { useArtistPageData } from "./use-artist-page-data";

type ReleaseLoadingState = Record<SpotifyArtistReleaseGroup, boolean>;

export interface ArtistContextValue {
  artistId: string;
  data: SpotifyArtistPageData;
  refreshing: boolean;
  loadingReleaseGroups: ReleaseLoadingState;
  loadMoreReleases: (includeGroups: SpotifyArtistReleaseGroup) => Promise<void>;
  refresh: () => Promise<void>;
}

const ArtistContext = createContext<ArtistContextValue | null>(null);

export function ArtistProvider({ children }: { children: ReactNode }) {
  const { artistId = "" } = useParams();

  const {
    data,
    error,
    loadMoreReleases,
    loading,
    loadingReleaseGroups,
    notFound,
    refresh,
    refreshing,
  } = useArtistPageData(artistId);

  if (loading) {
    return (
      <>
        <ArtistHeader href="/home" title={<Spinner />} />
        <SidebarContent />
      </>
    );
  }

  if (notFound) {
    return (
      <>
        <ArtistHeader href="/home" title={<CircleQuestionMarkIcon />} />
        <SidebarContent>
          <SectionContent>
            <p className="text-center">Artist Not Found</p>
          </SectionContent>
        </SidebarContent>
      </>
    );
  }

  if (error || !data) {
    return <ArtistError />;
  }

  return (
    <ArtistContext.Provider
      value={{
        artistId,
        data,
        loadMoreReleases,
        loadingReleaseGroups,
        refresh,
        refreshing,
      }}
    >
      {children}
    </ArtistContext.Provider>
  );
}

export function useArtist() {
  const ctx = useContext(ArtistContext);
  if (!ctx) {
    throw new Error("useArtist must be used within an ArtistProvider");
  }

  return ctx;
}
