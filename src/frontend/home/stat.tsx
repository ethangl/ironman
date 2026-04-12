import { cn } from "@/lib/utils";
import { ComponentProps, FC } from "react";

export const Stat: FC<ComponentProps<"div">> = ({ children, className }) => (
  <div
    className={cn(
      "flex font-bold gap-[0.05em] items-center justify-center min-w-8 mix-blend-plus-lighter px-[0.5em] py-[0.25em] relative text-emerald-500 text-sm",
      className,
    )}
  >
    <span className="absolute inset-0 bg-current opacity-10 rounded-3xl" />
    {children}
  </div>
);
