import { ComponentPropsWithoutRef, forwardRef } from "react";
import { Link as RouterLink, useInRouterContext } from "react-router-dom";

type AppLinkProps = ComponentPropsWithoutRef<"a"> & {
  href: string;
};

export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(
  function AppLink({ href, ...props }, ref) {
    const inRouterContext = useInRouterContext();
    const isInternal = href.startsWith("/");

    if (inRouterContext && isInternal && !props.target && !props.download) {
      return <RouterLink ref={ref} to={href} {...props} />;
    }

    return <a ref={ref} href={href} {...props} />;
  },
);
