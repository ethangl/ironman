import { ComponentProps, FC } from "react";

import { cn } from "@/lib/utils";

export const BackgroundOverlay: FC<ComponentProps<"div">> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "absolute bg-black dark:bg-white duration-555 inset-0 mix-blend-overlay opacity-25 group-hover:opacity-75 rounded-xl transition -z-1",
      className,
    )}
    {...props}
  />
);
