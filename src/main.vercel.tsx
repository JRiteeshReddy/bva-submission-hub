// SPA entry used only by the Vercel build (see vite.vercel.config.ts).
// Lovable preview/build continues to use TanStack Start's own entry.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  RouterProvider,
  createRouter,
  createMemoryHistory,
  createBrowserHistory,
} from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

const router = createRouter({
  routeTree,
  history:
    typeof window === "undefined"
      ? createMemoryHistory()
      : createBrowserHistory(),
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootEl = document.getElementById("root")!;
createRoot(rootEl).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
