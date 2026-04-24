import { ComponentProps, FC } from "react";

import { cn } from "@/lib/utils";
import { AppLink } from "./app-link";
import { Spinner } from "./ui/spinner";

export type ListProps = ComponentProps<"section"> & {
  count: number | undefined;
  empty?: string;
  loading?: boolean;
  title?: string;
};
const List: FC<ListProps> = ({
  className,
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

  return <ol className={cn("p-2 space-y-1", className)}>{children}</ol>;
};

const listItemClassName =
  "group/list bg-section-color/5 hover:bg-section-color/10 duration-888 hover:duration-222 gap-4 grid grid-cols-[max-content_minmax(0,1fr)_max-content] inset-ring-section-color/0 hover:inset-ring-section-color inset-ring-1 items-center p-2 rounded-xl transition-colors";

const ListItem: FC<ComponentProps<"li">> = ({ children, className }) => (
  <li className={cn(listItemClassName, className)}>{children}</li>
);

export type ListLinkProps = ComponentProps<typeof AppLink>;

const ListLink: FC<ListLinkProps> = ({ children, className, ...props }) => (
  <li>
    <AppLink className={cn(listItemClassName, className)} {...props}>
      {children}
    </AppLink>
  </li>
);

const ListItemAction: FC<ComponentProps<"div">> = ({ className, ...props }) => (
  <div
    className={cn(
      "duration-888 group-hover/list:duration-222 flex gap-1 items-center opacity-0 group-hover/list:opacity-100 transition-opacity",
      className,
    )}
    {...props}
  />
);

export { List, ListItem, ListItemAction, ListLink };
