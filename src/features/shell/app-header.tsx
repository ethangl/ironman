import { ArrowLeftIcon } from "lucide-react";
import { FC } from "react";

import { AppLink } from "@/components/app-link";
import { SidebarHeader, SidebarHeaderProps } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { SearchButton } from "../search/search-button";
import { AppSidebarToggle } from "./sidebar-toggle";

export type AppHeaderProps = SidebarHeaderProps & { href?: string };

export const AppHeader: FC<AppHeaderProps> = ({ href, ...props }) => (
  <SidebarHeader {...props}>
    {href ? (
      <Button
        variant="ghost"
        size="icon-sm"
        nativeButton={false}
        render={
          <AppLink href={href}>
            <ArrowLeftIcon />
          </AppLink>
        }
      />
    ) : (
      <SearchButton />
    )}
    <AppSidebarToggle />
  </SidebarHeader>
);
