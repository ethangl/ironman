import { TriangleAlertIcon } from "lucide-react";
import { FC } from "react";

import { SectionContent } from "@/components/section";
import { SidebarContent } from "@/components/sidebar";
import { SpotifyHeader } from "./spotify-header";

export type SpotifyErrorProps = { href?: string };

export const SpotifyError: FC<SpotifyErrorProps> = ({ href }) => (
  <>
    <SpotifyHeader href={href} title={<TriangleAlertIcon />} />
    <SidebarContent>
      <SectionContent className="flex justify-center">
        <p className="text-center">Error</p>
      </SectionContent>
    </SidebarContent>
  </>
);
