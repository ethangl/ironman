import { CircleQuestionMarkIcon } from "lucide-react";
import { createContext, useContext, type ReactNode } from "react";
import { useParams } from "react-router-dom";

import { SectionContent } from "@/components/section";
import { SidebarContent } from "@/components/sidebar";
import { Spinner } from "@/components/ui/spinner";
import type { SpotifyAlbumDetails } from "@/features/spotify-client/types";
import { SpotifyError } from "../spotify-shell/spotify-error";
import { SpotifyHeader } from "../spotify-shell/spotify-header";
import { useReleasePageData } from "./use-release-page-data";

export interface ReleaseContextValue {
  artistId: string;
  releaseId: string;
  data: SpotifyAlbumDetails;
  refreshing: boolean;
  refresh: () => Promise<void>;
}

const ReleaseContext = createContext<ReleaseContextValue | null>(null);

export function ReleaseProvider({ children }: { children: ReactNode }) {
  const { artistId = "", releaseId = "" } = useParams();

  const { data, error, loading, notFound, refresh, refreshing } =
    useReleasePageData(releaseId);

  if (loading) {
    return (
      <>
        <SpotifyHeader href={`/artist/${artistId}`} title={<Spinner />} />
        <SidebarContent />
      </>
    );
  }

  if (notFound) {
    return (
      <>
        <SpotifyHeader
          href={`/artist/${artistId}`}
          title={<CircleQuestionMarkIcon />}
        />
        <SidebarContent>
          <SectionContent>
            <p className="text-center">Release Not Found</p>
          </SectionContent>
        </SidebarContent>
      </>
    );
  }

  if (error || !data) {
    return <SpotifyError href={`/artist/${artistId}`} />;
  }

  return (
    <ReleaseContext.Provider
      value={{
        artistId,
        releaseId,
        data,
        refresh,
        refreshing,
      }}
    >
      {children}
    </ReleaseContext.Provider>
  );
}

export function useRelease() {
  const ctx = useContext(ReleaseContext);
  if (!ctx) {
    throw new Error("useRelease must be used within an ReleaseProvider");
  }

  return ctx;
}
