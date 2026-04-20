import { EllipsisVerticalIcon } from "lucide-react";
import { FC, PropsWithChildren } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const MoreMenu: FC<PropsWithChildren> = ({ ...props }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm">
            <EllipsisVerticalIcon />
          </Button>
        }
      />

      <DropdownMenuContent {...props} />
    </DropdownMenu>
  );
};
