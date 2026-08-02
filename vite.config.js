import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

// ─── Absolute project root (immune to cwd changes) ───────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Fix esbuild binary permissions ──────────────────────────────────────────
// OnSpace's Go syntax checker exec's node_modules/.bin/esbuild directly.
// The binary lacks execute permissions because the container skips postinstall.
// We apply chmod via THREE independent methods so at least one succeeds.
(function fixEsbuildPermissions() {
  const targets = [
    "node_modules/.bin",
    "node_modules/.bin/esbuild",
    "node_modules/esbuild/bin/esbuild",
    "node_modules/@esbuild/linux-x64/bin/esbuild",
    "node_modules/@esbuild/linux-arm64/bin/esbuild",
    "node_modules/@esbuild/linux-musl-x64/bin/esbuild",
    "node_modules/@esbuild/linux-musl-arm64/bin/esbuild",
  ].map(p => path.join(__dirname, p));

  // Method 1: fs.chmodSync — direct kernel syscall
  targets.forEach(p => {
    try { fs.chmodSync(p, 0o755); } catch (_) {}
  });

  // Method 2: /bin/chmod subprocess — runs as the actual OS user
  try {
    execFileSync("/bin/chmod", ["+x", ...targets.filter(p => {
      try { fs.accessSync(p); return true; } catch { return false; }
    })], { stdio: "ignore" });
  } catch (_) {}

  // Method 3: find + chmod — catches any glob the above might miss
  try {
    execFileSync("/usr/bin/find", [
      path.join(__dirname, "node_modules"),
      "-path", "*/esbuild*/esbuild",
      "-exec", "/bin/chmod", "+x", "{}", ";",
    ], { stdio: "ignore" });
  } catch (_) {}
})();

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
