import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Vite outputs to apps/landing/dist/ (gitignored). The deploy workflow
// copies dist/* into ../web/ before running wrangler, overwriting the
// static index.html but leaving the static /verify, /metrics, /leaderboard,
// /logs pages alone. Locally, `pnpm landing:dev` is the way to preview.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },
});
