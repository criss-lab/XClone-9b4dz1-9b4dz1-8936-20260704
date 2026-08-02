import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { rmSync } from "fs";

// ── Permanent esbuild CLI fix ─────────────────────────────────────────────────
// OnSpace's Go binary runs `fork/exec node_modules/.bin/esbuild` as a
// pre-build syntax check.  The CLI wrapper binary lacks execute permissions
// in OnSpace's container.  Vite itself never uses the CLI — it uses esbuild's
// Node.js API (node_modules/esbuild/lib/main.js → native platform binary).
//
// PRIMARY FIX: bin-links=false in .npmrc prevents bun from ever creating
// the node_modules/.bin/esbuild symlink during install.
//
// SECONDARY FIX (failsafe): If the binary somehow exists (e.g. cached from
// a previous install), delete it here so OnSpace gets ENOENT instead of
// EACCES. This runs every time vite.config.js is loaded.
[
  "./node_modules/.bin/esbuild",
  "./node_modules/esbuild/bin/esbuild",
  "./node_modules/.bin/esbuild.cmd",
  "./node_modules/.bin/esbuild.ps1",
].forEach((p) => {
  try { rmSync(p, { force: true }); } catch { /* ignore */ }
});

// ── Stub path (Capacitor + Vercel Analytics → web no-ops) ────────────────────
const stub = path.resolve("./src/lib/capacitor-stub.ts");

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve("./src"),

      // Platform-only packages → web-safe stub
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
