// Vercel-only Vite config. Produces a plain SPA build (no Cloudflare Worker,
// no TanStack Start SSR). The app uses only the browser Supabase client with
// the publishable key, so SSR is not needed.
//
// Lovable's in-editor preview and `bun run build` continue to use the default
// vite.config.ts. This file is invoked by vercel.json's buildCommand.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "node:path";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: path.resolve(__dirname, "src/routes"),
      generatedRouteTree: path.resolve(__dirname, "src/routeTree.gen.ts"),
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      input: path.resolve(__dirname, "index.vercel.html"),
    },
  },
});
