import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

const STATIC_ROUTES = ['verify', 'metrics', 'leaderboard', 'logs', '_shared'] as const;

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
};

/**
 * Dev-only plugin: serve the static sub-routes from ../web/{verify,metrics,...}
 * while Vite serves the React landing on /. In production, Cloudflare Pages
 * already serves these directories natively from apps/web/.
 */
function serveStaticSubRoutes(): PluginOption {
  const root = path.resolve(__dirname, '..', 'web');
  return {
    name: 'serve-static-subroutes',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0];
        const m = url.match(new RegExp(`^/(${STATIC_ROUTES.join('|')})(/.*)?$`));
        if (!m) return next();

        const subdir = m[1];
        const tail = m[2] || '/';
        const fileSubpath = tail === '/' || tail === '' ? '/index.html' : tail;
        const target = path.join(root, subdir, fileSubpath);

        // Containment check — never serve outside ../web/<subdir>
        const safe = path.resolve(target);
        if (!safe.startsWith(path.resolve(root, subdir))) return next();

        if (!fs.existsSync(safe) || fs.statSync(safe).isDirectory()) return next();

        const ext = path.extname(safe).toLowerCase();
        res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
        res.end(fs.readFileSync(safe));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), serveStaticSubRoutes()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },
});
