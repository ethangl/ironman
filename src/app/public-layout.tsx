import { Outlet } from "react-router-dom";

import { PublicNavbar } from "./public-navbar";

export function PublicLayout() {
  return (
    <>
      <PublicNavbar />
      <Outlet />
    </>
  );
}
