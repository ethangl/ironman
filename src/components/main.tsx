import { ComponentProps, FC, PropsWithChildren, ReactNode } from "react";

import { BackgroundOverlay } from "@/components/background-overlay";
import { cn } from "@/lib/utils";

export const Main: FC<ComponentProps<"div">> = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col gap-3 max-h-full min-w-sm overflow-hidden",
      className,
    )}
    {...props}
  />
);

export const MainWrapper: FC<PropsWithChildren> = ({ children }) => {
  return (
    <main
      className={cn(
        "group/main duration-1111 flex flex-1 flex-col overflow-hidden relative rounded-3xl transition-colors",
      )}
    >
      <BackgroundOverlay />
      {children}
    </main>
  );
};

export type MainhHeaderProps = PropsWithChildren & { title?: ReactNode };

export const MainHeader: FC<MainhHeaderProps> = ({ children, title }) => (
  <header className="flex flex-none gap-2 h-16 items-center justify-between px-4 relative shadow-[0_1px_0_--alpha(var(--color-background)/33%)] top-0">
    {title && (
      <span
        className={cn(
          "absolute flex inset-0 items-center justify-center m-auto pointer-events-none transition-opacity truncate",
        )}
      >
        {title}
      </span>
    )}
    {children}
  </header>
);

export const MainFooter: FC<PropsWithChildren> = ({ ...props }) => (
  <footer
    className="flex flex-none gap-2 h-16 items-center justify-between px-4 shadow-[0_-1px_0_--alpha(var(--color-background)/33%)]"
    {...props}
  />
);

export const MainContent: FC<PropsWithChildren> = ({ ...props }) => (
  <div
    className="flex flex-col flex-1 overflow-y-auto scrollbar-none"
    {...props}
  />
);
