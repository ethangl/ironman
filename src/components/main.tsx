import { CSSProperties, FC, PropsWithChildren } from "react";

import { BackgroundOverlay } from "@/components/background-overlay";
import { cn } from "@/lib/utils";

type StyleWithCssVariables = CSSProperties & {
  [key: `--${string}`]: string | number | undefined;
};

export type MainProps = PropsWithChildren & {
  style?: StyleWithCssVariables;
};

export const Main: FC<MainProps> = ({ children, style }) => {
  return (
    <main
      className={cn(
        "group/main flex flex-col max-h-full min-w-md overflow-hidden relative rounded-3xl text-section-color",
      )}
      style={style}
    >
      <BackgroundOverlay className="backdrop-brightness-600 backdrop-contrast-600 bg-section-color/50 mix-blend-exclusion" />
      {children}
    </main>
  );
};

export const MainHeader: FC<PropsWithChildren> = ({ ...props }) => (
  <header
    className="flex flex-none gap-2 h-16 items-center justify-between px-4 shadow-[0_1px_0_--alpha(var(--color-background)/33%)] text-white"
    {...props}
  />
);

export const MainFooter: FC<PropsWithChildren> = ({ ...props }) => (
  <footer
    className="flex flex-none gap-2 h-16 items-center justify-between px-4 shadow-[0_-1px_0_--alpha(var(--color-background)/33%)] text-white"
    {...props}
  />
);

export const MainContent: FC<PropsWithChildren> = ({ ...props }) => (
  <div
    className="flex flex-col flex-1 overflow-y-auto scrollbar-none"
    {...props}
  />
);
