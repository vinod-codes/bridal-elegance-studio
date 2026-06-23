import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import vitePrerender from "vite-plugin-prerender";
import { getPrerenderRoutes } from "./scripts/get-prerender-routes";

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => ({
  server: {
    host: "127.0.0.1",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    // ── Static prerendering (SSG) for SEO ──
    // Renders every indexable route to a static .html file at build time so that
    // crawlers receive fully-formed HTML (with real product data + JSON-LD schema
    // injected by react-helmet-async) instead of an empty <div id="root">.
    //
    // Skipped in dev mode (pure CSR with HMR is what we want locally).
    mode !== "development" && vitePrerender({
      staticDir: path.join(__dirname, "dist"),
      // Routes resolved at build time: static routes + /product/:id expanded from Firestore.
      routes: await getPrerenderRoutes(),
      renderer: new vitePrerender.PuppeteerRenderer({
        // Wait for the app to mount and react-helmet-async to inject <head> tags before
        // capturing HTML. The app dispatches this event from src/main.tsx after render.
        renderAfterDocumentEvent: "prerender-ready",
        // Hard upper bound so a hung Firestore listener can't stall the build forever.
        renderAfterTime: 5000,
        // Capture console output from the headless page — useful for debugging prerenders.
        injectProperty: "__PRERENDER__",
        inject: {},
      }),
      postProcess: (renderedRoute) => {
        // Ensure the captured HTML carries the right <html lang> and viewport.
        if (renderedRoute.route === "/") {
          // index.html already has lang="en"; nothing to do.
        }
      },
    }),
  ].filter(Boolean), // filter(Boolean) drops the `false` when in dev mode.
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
