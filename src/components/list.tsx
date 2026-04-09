import { ComponentProps, FC, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";
import { AppLink } from "./app-link";
import { Spinner } from "./ui/spinner";

export type ListProps = PropsWithChildren & {
  count: number | undefined;
  empty?: string;
  loading?: boolean;
  title?: string;
};

const listItemClassName =
  "bg-accent/15 gap-4 grid grid-cols-[max-content_max-content_minmax(0,1fr)_max-content] items-center px-3 py-2.5 rounded-xl";

const List: FC<ListProps> = ({
  children,
  count,
  empty = "No results",
  loading,
  title,
}) => {
  return (
    <section className="space-y-4">
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
  <li className={cn(listItemClassName, className)}>{children}</li>
);

export type ListLinkProps = ComponentProps<typeof AppLink>;

const listLinkClassName = "hover:bg-accent/30 transition-colors";

const ListLink: FC<ListLinkProps> = ({ children, className, ...props }) => (
  <li>
    <AppLink
      className={cn(listItemClassName, listLinkClassName, className)}
      {...props}
    >
      {children}
    </AppLink>
  </li>
);

export { List, ListItem, ListLink };
