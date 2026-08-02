import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

// ─── Fix esbuild binary permissions ──────────────────────────────────────────
// OnSpace Cloud's container skips npm postinstall scripts, so the esbuild
// shell-script wrapper in node_modules/.bin/ never gets chmod +x applied.
// fs.chmodSync is a direct kernel syscall (not a subprocess exec), so it works
// even in restricted containers. It runs here — when OnSpace loads this config
// before its syntax checker — giving the binary execute permissions in time.
[
  "node_modules/.bin/esbuild",
  "node_modules/esbuild/bin/esbuild",
  "node_modules/@esbuild/linux-x64/bin/esbuild",
  "node_modules/@esbuild/linux-arm64/bin/esbuild",
  "node_modules/@esbuild/linux-musl-x64/bin/esbuild",
  "node_modules/@esbuild/linux-musl-arm64/bin/esbuild",
].forEach(p => {
  try { fs.chmodSync(p, 0o755); } catch (_) { /* file absent or noexec fs — ignored */ }
});

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },

  plugins: [
    react(),
  ],

  build: {
    minify: false,
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
      "@": path.resolve(process.cwd(), "./src"),
      "@capacitor/core":                         path.resolve(process.cwd(), "./src/lib/capacitor-stub.ts"),
      "@capacitor/status-bar":                   path.resolve(process.cwd(), "./src/lib/capacitor-stub.ts"),
      "@capacitor/app":                          path.resolve(process.cwd(), "./src/lib/capacitor-stub.ts"),
      "@capacitor/device":                       path.resolve(process.cwd(), "./src/lib/capacitor-stub.ts"),
      "@capacitor/filesystem":                   path.resolve(process.cwd(), "./src/lib/capacitor-stub.ts"),
      "@capacitor/network":                      path.resolve(process.cwd(), "./src/lib/capacitor-stub.ts"),
      "@capacitor/push-notifications":           path.resolve(process.cwd(), "./src/lib/capacitor-stub.ts"),
      "@capacitor/share":                        path.resolve(process.cwd(), "./src/lib/capacitor-stub.ts"),
      "@capacitor-community/admob":              path.resolve(process.cwd(), "./src/lib/capacitor-stub.ts"),
      "@capacitor-community/firebase-analytics": path.resolve(process.cwd(), "./src/lib/capacitor-stub.ts"),
      "@capacitor-community/media":              path.resolve(process.cwd(), "./src/lib/capacitor-stub.ts"),
      "@capgo/capacitor-updater":                path.resolve(process.cwd(), "./src/lib/capacitor-stub.ts"),
      "@vercel/analytics/react":                 path.resolve(process.cwd(), "./src/lib/capacitor-stub.ts"),
    },
  },
});
