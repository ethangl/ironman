import {
  createContext,
  FC,
  PropsWithChildren,
  ReactNode,
  useContext,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { BackgroundOverlay } from "@/components/background-overlay";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export type SidebarProps = PropsWithChildren & {
  bgClassName: string;
  className: string;
  defaultExpanded?: boolean;
};

export type SidebarState = [boolean, Dispatch<SetStateAction<boolean>>];

const SidebarStateContext = createContext<SidebarState | null>(null);

export function useSidebarState() {
  const sidebarState = useContext(SidebarStateContext);
  if (!sidebarState) {
    throw new Error("useSidebarState must be used within a Sidebar.");
  }

  return sidebarState;
}

export const Sidebar: FC<SidebarProps> = ({
  bgClassName,
  children,
  className,
  defaultExpanded = true,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <SidebarStateContext.Provider value={[expanded, setExpanded]}>
      <aside
        className={cn(
          "group/sidebar duration-222 ease-out flex flex-col max-h-full overflow-hidden relative rounded-3xl text-cyan-300 transition-all",
          expanded ? "w-md" : "w-16",
          className,
        )}
      >
        <BackgroundOverlay
          className={cn(
            "backdrop-brightness-600 backdrop-contrast-600 mix-blend-exclusion",
            bgClassName,
          )}
        />
        {children}
      </aside>
    </SidebarStateContext.Provider>
  );
};

export const SidebarHeader: FC<PropsWithChildren> = ({ ...props }) => {
  return (
    <header className="flex flex-none group-first/sidebar:justify-end overflow-hidden shadow-[0_1px_0_--alpha(var(--color-background)/33%)] w-full">
      <div
        className="flex flex-1 gap-2 h-16 items-center justify-between px-4 relative text-white w-md"
        {...props}
      />
    </header>
  );
};

export const SidebarFooter: FC<PropsWithChildren> = ({ ...props }) => {
  return (
    <footer className="flex flex-none group-first/sidebar:justify-end overflow-hidden shadow-[0_-1px_0_--alpha(var(--color-background)/33%)] w-full">
      <div
        className="flex gap-2 h-16 items-center justify-between px-4 text-white w-md"
        {...props}
      />
    </footer>
  );
};

export type SidebarToggleProps = {
  collapseIcon: ReactNode;
  expandIcon: ReactNode;
};

export const SidebarToggle: FC<SidebarToggleProps> = ({
  collapseIcon,
  expandIcon,
}) => {
  const [expanded, setExpanded] = useSidebarState();
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setExpanded((expanded) => !expanded)}
    >
      {expanded ? collapseIcon : expandIcon}
    </Button>
  );
};

export const SidebarContent: FC<PropsWithChildren> = ({ ...props }) => {
  const [expanded] = useSidebarState();
  return (
    <div className="flex flex-col flex-1 overflow-hidden w-full">
      <div
        className={cn(
          "flex-1 overflow-y-auto scrollbar-none transition-margin w-md",
          expanded
            ? "duration-222 ease-out"
            : "duration-222 ease-out ml-16 pointer-events-none",
        )}
        {...props}
      />
    </div>
  );
};
