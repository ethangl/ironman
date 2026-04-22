import { useParams } from "react-router-dom";

import { SectionContent } from "@/components/section";
import { SidebarContent } from "@/components/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useArtistPageData } from "@/features/artist";
import { Artist } from "@/features/artist/artist";
import { ArtistError } from "@/features/artist/artist-error";
import { ArtistHeader } from "@/features/artist/artist-header";
import { CircleQuestionMarkIcon } from "lucide-react";

export function ArtistRoute() {
  const { artistId = "" } = useParams();
  const { data, loading, error, notFound } = useArtistPageData(artistId);

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
    <>
      <ArtistHeader href="/home" title={data.artist.name} />
      <Artist artistData={data} />
    </>
  );
}
