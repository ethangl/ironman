import {
  ComponentProps,
  createContext,
  CSSProperties,
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

type SidebarState = [boolean, Dispatch<SetStateAction<boolean>>];

const SidebarStateContext = createContext<SidebarState | null>(null);

function useSidebarState() {
  const sidebarState = useContext(SidebarStateContext);
  if (!sidebarState) {
    throw new Error("useSidebarState must be used within a Sidebar.");
  }

  return sidebarState;
}

const Sidebar: FC<ComponentProps<"div">> = ({ className, ...props }) => {
  const [expanded, setExpanded] = useState(true);
  return (
    <SidebarStateContext.Provider value={[expanded, setExpanded]}>
      <div
        className={cn(
          "group/sidebar duration-111 ease-out flex flex-col gap-3 max-h-full overflow-hidden transition-all",
          expanded ? "w-sm" : "w-16",
          className,
        )}
        {...props}
      />
    </SidebarStateContext.Provider>
  );
};

type SidebarWrapperProps = PropsWithChildren & {
  className?: string;
  style?: StyleWithCssVariables;
};

type StyleWithCssVariables = CSSProperties & {
  [key: `--${string}`]: string | number | undefined;
};

const SidebarWrapper: FC<SidebarWrapperProps> = ({
  children,
  className,
  style,
}) => (
  <aside
    className={cn(
      "flex flex-1 flex-col overflow-hidden relative rounded-3xl",
      className,
    )}
    style={style}
  >
    <BackgroundOverlay />
    {children}
  </aside>
);

type SidebarHeaderProps = PropsWithChildren & {
  title?: ReactNode;
  subtitle?: string;
};

const SidebarHeader: FC<SidebarHeaderProps> = ({
  children,
  title,
  subtitle,
}) => {
  const [expanded] = useSidebarState();
  return (
    <header className="flex flex-none group-first/sidebar:justify-end overflow-hidden shadow-[0_1px_0_--alpha(var(--color-background)/33%)] w-full">
      <div className="flex flex-1 gap-4 h-16 items-center justify-between px-3.5 relative w-sm">
        {title && (
          <div
            className={cn(
              "absolute flex flex-col inset-0 items-center justify-center m-auto pointer-events-none transition-opacity truncate",
              expanded ? "delay-111 duration-222" : "duration-11 opacity-0",
            )}
          >
            <div>{title}</div>
            {subtitle && (
              <div className="text-[11px] text-muted-foreground">
                {subtitle}
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    </header>
  );
};

const SidebarFooter: FC<PropsWithChildren> = ({ ...props }) => {
  return (
    <footer className="flex flex-none group-first/sidebar:justify-end overflow-hidden shadow-[0_-1px_0_--alpha(var(--color-background)/33%)] w-full">
      <div
        className="flex gap-4 h-16 items-center justify-between px-4 w-sm"
        {...props}
      />
    </footer>
  );
};

type SidebarToggleProps = {
  collapseIcon: ReactNode;
  expandIcon: ReactNode;
};

const SidebarToggle: FC<SidebarToggleProps> = ({
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

const SidebarContent: FC<PropsWithChildren> = ({ ...props }) => {
  const [expanded] = useSidebarState();
  return (
    <div className="flex flex-col flex-1 overflow-hidden w-full">
      <div
        className={cn(
          "flex-1 overflow-y-auto transition-margin w-sm",
          expanded
            ? "duration-111 ease-out"
            : "duration-111 ease-out ml-16 pointer-events-none",
        )}
        {...props}
      />
    </div>
  );
};

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarToggle,
  SidebarWrapper,
  useState,
};

export type { SidebarToggleProps, SidebarWrapperProps };
