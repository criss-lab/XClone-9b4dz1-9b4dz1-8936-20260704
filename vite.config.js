import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },

  plugins: [
    react(),
  ],

  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        warn(warning);
      },
    },
  },

  optimizeDeps: {
    exclude: [
      "@capacitor/core",
      "@capacitor/status-bar",
      "@capacitor/push-notifications",
      "@capacitor-community/admob",
      "@capgo/capacitor-updater",
    ],
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@capacitor/core":                         path.resolve(__dirname, "./src/lib/capacitor-stub.ts"),
      "@capacitor/status-bar":                   path.resolve(__dirname, "./src/lib/capacitor-stub.ts"),
      "@capacitor/app":                          path.resolve(__dirname, "./src/lib/capacitor-stub.ts"),
      "@capacitor/device":                       path.resolve(__dirname, "./src/lib/capacitor-stub.ts"),
      "@capacitor/filesystem":                   path.resolve(__dirname, "./src/lib/capacitor-stub.ts"),
      "@capacitor/network":                      path.resolve(__dirname, "./src/lib/capacitor-stub.ts"),
      "@capacitor/push-notifications":           path.resolve(__dirname, "./src/lib/capacitor-stub.ts"),
      "@capacitor/share":                        path.resolve(__dirname, "./src/lib/capacitor-stub.ts"),
      "@capacitor-community/admob":              path.resolve(__dirname, "./src/lib/capacitor-stub.ts"),
      "@capacitor-community/firebase-analytics": path.resolve(__dirname, "./src/lib/capacitor-stub.ts"),
      "@capacitor-community/media":              path.resolve(__dirname, "./src/lib/capacitor-stub.ts"),
      "@capgo/capacitor-updater":                path.resolve(__dirname, "./src/lib/capacitor-stub.ts"),
      "@vercel/analytics/react":                 path.resolve(__dirname, "./src/lib/capacitor-stub.ts"),
    },
  },
});
