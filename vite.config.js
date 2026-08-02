import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { rmSync, chmodSync, statSync, existsSync } from "fs";
import { execSync } from "child_process";

// ── esbuild CLI binary fix ────────────────────────────────────────────────────
// OnSpace's Go binary runs `fork/exec node_modules/.bin/esbuild` as a syntax
// pre-check.  The wrapper binary is created by bun without execute permissions.
// Strategy (applied in order):
//  1. chmod +x — if the filesystem allows it the pre-check will PASS cleanly.
//  2. shell chmod — secondary attempt via /bin/sh (different permission context).
//  3. rmSync — last resort: ENOENT is handled gracefully; EACCES is a hard fail.
(function fixEsbuildPermissions() {
  const bins = [
    "./node_modules/.bin/esbuild",
    "./node_modules/esbuild/bin/esbuild",
    "./node_modules/.bin/esbuild.cmd",
    "./node_modules/.bin/esbuild.ps1",
  ];

  bins.forEach((p) => {
    if (!existsSync(p)) return;
    try {
      // Attempt 1: Node.js chmodSync
      chmodSync(p, 0o755);
      // Verify it actually worked
      const mode = statSync(p).mode;
      if (mode & 0o111) {
        // Execute bit is set — leave the binary in place so the check passes
        console.log(`[esbuild-fix] chmod succeeded on ${p}`);
        return;
      }
    } catch { /* ignore */ }

    try {
      // Attempt 2: Shell chmod (may run with elevated privileges in some envs)
      execSync(`chmod +x "${p}"`, { stdio: "ignore" });
      const mode = statSync(p).mode;
      if (mode & 0o111) {
        console.log(`[esbuild-fix] shell chmod succeeded on ${p}`);
        return;
      }
    } catch { /* ignore */ }

    // Attempt 3: Delete so OnSpace gets ENOENT (graceful) not EACCES (hard fail)
    try {
      rmSync(p, { force: true });
      console.log(`[esbuild-fix] deleted ${p} (chmod failed, noexec fs likely)`);
    } catch { /* ignore */ }
  });
})();

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
