import { ComponentPropsWithoutRef, forwardRef } from "react";
import {
  Link as RouterLink,
  useInRouterContext,
  useLocation,
} from "react-router-dom";

type AppLinkProps = ComponentPropsWithoutRef<"a"> & {
  href: string;
  preserveSearch?: boolean;
};

function appendSearch(href: string, search: string) {
  if (!search || href.includes("?")) {
    return href;
  }

  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) {
    return `${href}${search}`;
  }

  return `${href.slice(0, hashIndex)}${search}${href.slice(hashIndex)}`;
}

const InternalAppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(
  function InternalAppLink({ href, preserveSearch = true, ...props }, ref) {
    const location = useLocation();
    const to = preserveSearch ? appendSearch(href, location.search) : href;

    return <RouterLink ref={ref} to={to} {...props} />;
  },
);

export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(
  ({ href, preserveSearch = true, ...props }, ref) => {
    const inRouterContext = useInRouterContext();
    const isInternal = href.startsWith("/");

    if (inRouterContext && isInternal && !props.target && !props.download) {
      return (
        <InternalAppLink
          ref={ref}
          href={href}
          preserveSearch={preserveSearch}
          {...props}
        />
      );
    }

    return <a ref={ref} href={href} {...props} />;
  },
);
