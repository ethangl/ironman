import { ComponentProps, CSSProperties, FC } from "react";

import { BackgroundOverlay } from "@/components/background-overlay";
import { cn } from "@/lib/utils";

export type SectionProps = ComponentProps<"section"> & {
  color: string;
  title?: string;
};

export const Section: FC<SectionProps> = ({
  children,
  className,
  color,
  title,
  ...props
}) => {
  return (
    <section
      className={cn("m-3 relative", className)}
      style={{ "--section-color": `var(${color})` } as CSSProperties}
      {...props}
    >
      <BackgroundOverlay className="dark:bg-(--section-color)/50 backdrop-brightness-600 backdrop-contrast-600 mix-blend-exclusion rounded-[2rem]" />
      {title && (
        <header className="px-6 pt-5 pb-1 text-(--section-color)">
          <h2 className="font-medium text-2xl tracking-[0.025em]">{title}</h2>
        </header>
      )}
      {children}
    </section>
  );
};
