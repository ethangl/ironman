import { ComponentProps, CSSProperties, FC, ReactNode } from "react";

import { BackgroundOverlay } from "@/components/background-overlay";
import { cn } from "@/lib/utils";

export type SectionProps = ComponentProps<"section"> & {
  action?: ReactNode;
  color?: string;
  title?: string;
};

export const Section: FC<SectionProps> = ({
  action,
  children,
  className,
  color = "--color-emerald-400",
  title,
  ...props
}) => {
  return (
    <section
      className={cn("relative select-none", className)}
      style={{ "--section-color": `var(${color})` } as CSSProperties}
      {...props}
    >
      <BackgroundOverlay className="dark:bg-(--section-color)/50 backdrop-brightness-600 backdrop-contrast-600 mix-blend-exclusion rounded-[2rem]" />
      {title && (
        <header className="flex items-center justify-between gap-3 p-6 pb-2 relative text-(--section-color) z-10">
          <h2 className="font-medium text-3xl tracking-[0.015em]">{title}</h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
};
