import { TriangleAlertIcon } from "lucide-react";

import { SectionContent } from "@/components/section";
import { SidebarContent } from "@/components/sidebar";
import { ArtistHeader } from "@/features/artist/artist-header";

export const ArtistError = () => (
  <>
    <ArtistHeader href="/home" title={<TriangleAlertIcon />} />
    <SidebarContent>
      <SectionContent className="flex justify-center">
        <p className="text-center">Error</p>
      </SectionContent>
    </SidebarContent>
  </>
);
