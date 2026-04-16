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
  "group gap-4 grid grid-cols-[max-content_max-content_minmax(0,1fr)_max-content] items-center px-3 py-2.5 relative rounded-xl";

const List: FC<ListProps> = ({
  children,
  className,
  count,
  empty = "No results",
  loading,
  title,
}) => {
  return (
    <section className={cn("space-y-4", className)}>
      {title && <h3 className="text-lg font-bold">{title}</h3>}
      {loading ? (
        <div className={listItemClassName}>
          <Spinner />
        </div>
      ) : count !== 0 ? (
        <ol className="space-y-2">{children}</ol>
      ) : (
        <div className={listItemClassName}>
          <p className="text-muted-foreground text-xs">{empty}</p>
        </div>
      )}
    </section>
  );
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
