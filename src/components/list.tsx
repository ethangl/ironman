import { ComponentProps, FC } from "react";

import { cn } from "@/lib/utils";
import { AppLink } from "./app-link";
import { BackgroundOverlay } from "./background-overlay";
import { Spinner } from "./ui/spinner";

export type ListProps = ComponentProps<"section"> & {
  count: number | undefined;
  empty?: string;
  loading?: boolean;
  title?: string;
};

const listItemClassName =
  "group gap-3 grid grid-cols-[max-content_minmax(0,1fr)_max-content] items-center px-3 py-2.5 relative rounded-xl";

const List: FC<ListProps> = ({
  children,
  count,
  empty = "No results",
  loading,
}) => {
  if (loading) {
    return (
      <div className={listItemClassName}>
        <Spinner />
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className={listItemClassName}>
        <p className="text-muted-foreground text-xs">{empty}</p>
      </div>
    );
  }

  return <ol className="space-y-1">{children}</ol>;
};

const ListItem: FC<ComponentProps<"li">> = ({ children, className }) => (
  <li className={cn(listItemClassName, className)}>
    <BackgroundOverlay />
    {children}
  </li>
);

export type ListLinkProps = ComponentProps<typeof AppLink>;

const listLinkClassName = "hover:bg-accent/30 transition-colors";

const ListLink: FC<ListLinkProps> = ({ children, className, ...props }) => (
  <li>
    <AppLink
      className={cn(listItemClassName, listLinkClassName, className)}
      {...props}
    >
      <BackgroundOverlay />
      {children}
    </AppLink>
  </li>
);

export { List, ListItem, ListLink };
