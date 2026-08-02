// EARLY CLEANUP — PostCSS config is evaluated before the Vite/esbuild syntax
// check.  Removing the CLI wrapper here means OnSpace gets ENOENT (graceful
// skip) instead of EACCES (hard failure) when it tries fork/exec on esbuild.
import { rmSync } from 'fs';
[
  './node_modules/.bin/esbuild',
  './node_modules/esbuild/bin/esbuild',
  './node_modules/.bin/esbuild.cmd',
  './node_modules/.bin/esbuild.ps1',
].forEach(p => { try { rmSync(p, { force: true }); } catch { /* ignore */ } });

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
