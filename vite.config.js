import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Resolve the capacitor stub once — used for all native-only packages
const stub = path.resolve("./src/lib/capacitor-stub.ts");

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },

  plugins: [react()],

  resolve: {
    alias: {
      // Path alias used throughout the app
      "@": path.resolve("./src"),

      // Stub out native-only packages so the web build never touches them
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
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        warn(warning);
      },
    },
  },
});
