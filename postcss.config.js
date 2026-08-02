// Early cleanup — PostCSS config is one of the first files OnSpace evaluates.
// Run the same chmod-then-delete strategy as vite.config.js.
import { rmSync, chmodSync, statSync, existsSync } from "fs";
import { execSync } from "child_process";

(function fixEsbuildBins() {
  const bins = [
    "./node_modules/.bin/esbuild",
    "./node_modules/esbuild/bin/esbuild",
  ];
  bins.forEach((p) => {
    if (!existsSync(p)) return;
    try { chmodSync(p, 0o755); } catch { /* ignore */ }
    try { execSync(`chmod +x "${p}"`, { stdio: "ignore" }); } catch { /* ignore */ }
    // Only delete if still not executable
    try {
      if (!((statSync(p).mode) & 0o111)) rmSync(p, { force: true });
    } catch { try { rmSync(p, { force: true }); } catch { /* ignore */ } }
  });
})();

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
