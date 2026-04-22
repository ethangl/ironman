import { ComponentProps, FC } from "react";

import { cn } from "@/lib/utils";

export const Section: FC<ComponentProps<"section">> = ({
  children,
  className,
}) => {
  return (
    <section className={cn("relative select-none", className)}>
      {children}
    </section>
  );
};

export const SectionHeader: FC<ComponentProps<"header">> = ({
  className,
  ...props
}) => <header className={cn("p-6 pb-0 space-y-2", className)} {...props} />;

export const SectionTitle: FC<ComponentProps<"h2">> = ({
  className,
  ...props
}) => (
  <h2
    className={cn(
      "flex gap-3 font-medium items-center justify-between text-2xl tracking-[0.015em]",
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
}) => <div className={cn("p-6 text-foreground", className)} {...props} />;

export const SectionFooter: FC<ComponentProps<"header">> = ({
  className,
  ...props
}) => (
  <footer
    className={cn(
      "flex gap-3 items-center justify-between p-6 pt-0",
      className,
    )}
    {...props}
  />
);
