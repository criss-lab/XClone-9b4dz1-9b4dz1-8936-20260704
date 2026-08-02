import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Stub path — redirects all native/platform packages to a web-safe no-op
const stub = path.resolve("./src/lib/capacitor-stub.ts");

export default defineConfig({
  // Tell Vite (and OnSpace's wrapper) NOT to use the esbuild binary for
  // source transforms. @vitejs/plugin-react handles .tsx via Babel.
  // This prevents OnSpace from invoking node_modules/.bin/esbuild entirely.
  esbuild: false,

  // Skip automatic dep discovery/pre-bundling — also uses esbuild under the
  // hood, so disabling it removes the second esbuild invocation path.
  optimizeDeps: {
    noDiscovery: true,
    include: [],
  },

  server: {
    host: "::",
    port: 8080,
  },

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve("./src"),

      // Platform-only packages → web-safe stub (no native code in browser)
      "@capacitor/core":                         stub,
      "@capacitor/status-bar":                   stub,
      "@capacitor/app":                          stub,
      "@capacitor/device":                       stub,
      "@capacitor/filesystem":                   stub,
      "@capacitor/network":                      stub,
      "@capacitor/push-notifications":           stub,
      "@capacitor/share":                        stub,
      "@capacitor-community/admob":              stub,
      "@capacitor-community/firebase-analytics": stub,
      "@capacitor-community/media":              stub,
      "@capgo/capacitor-updater":                stub,
      "@vercel/analytics/react":                 stub,
    },
  },

  build: {
    // Use Rollup's own minification (not esbuild) so the binary is never
    // needed during production builds either.
    minify: "terser",
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        warn(warning);
      },
    },
  },
});
