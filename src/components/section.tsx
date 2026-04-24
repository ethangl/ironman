import { ComponentProps, FC } from "react";

import { cn } from "@/lib/utils";

export const Section: FC<ComponentProps<"section">> = ({
  children,
  className,
}) => {
  return (
    <section className={cn("relative select-none space-y-2", className)}>
      {children}
    </section>
  );
};

export const SectionHeader: FC<ComponentProps<"header">> = ({
  className,
  ...props
}) => <header className={cn("px-4 pt-4 space-y-1", className)} {...props} />;

export const SectionTitle: FC<ComponentProps<"h2">> = ({
  className,
  ...props
}) => (
  <h2
    className={cn(
      "flex gap-3 font-medium items-center justify-between text-2xl leading-8 text-section-color/88 tracking-[0.015em]",
      className,
    )}
    {...props}
  />
);

export const SectionDescription: FC<ComponentProps<"h4">> = ({
  className,
  ...props
}) => (
  <h4
    className={cn("font-medium text-muted-foreground text-sm", className)}
    {...props}
  />
);

export const SectionContent: FC<ComponentProps<"div">> = ({
  className,
  ...props
}) => <div className={cn("px-4", className)} {...props} />;

export const SectionFooter: FC<ComponentProps<"header">> = ({
  className,
  ...props
}) => (
  <footer
    className={cn(
      "flex gap-3 items-center justify-between px-4 pb-4",
      className,
    )}
    {...props}
  />
);
