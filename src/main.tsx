import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { router } from "@/frontend/router";
import "./globals.css";

document.documentElement.lang = "en";
document.documentElement.classList.add("dark", "antialiased");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
