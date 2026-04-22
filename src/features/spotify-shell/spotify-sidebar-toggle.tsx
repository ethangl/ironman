import { LibraryIcon, PanelLeftCloseIcon } from "lucide-react";
import { FC } from "react";

import { SidebarToggle } from "@/components/sidebar";

export const SpotfiySidebarToggle: FC = () => (
  <SidebarToggle
    collapseIcon={<PanelLeftCloseIcon />}
    expandIcon={<LibraryIcon />}
  />
);
