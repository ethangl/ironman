import { LibraryIcon, PanelLeftCloseIcon } from "lucide-react";
import { FC } from "react";

import { SidebarToggle } from "@/components/sidebar";

export const AppSidebarToggle: FC = () => (
  <SidebarToggle
    collapseIcon={<PanelLeftCloseIcon />}
    expandIcon={<LibraryIcon />}
  />
);
