import { ComponentProps, FC } from "react";

import { cn } from "@/lib/utils";

export const Square: FC<ComponentProps<"div">> = ({ className, ...props }) => (
  <div
    className={cn("flex items-center justify-center size-10", className)}
    {...props}
  />
);
