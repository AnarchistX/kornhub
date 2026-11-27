import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Built into the site's public /echo_protocol/ folder, which is served as static files.
export default defineConfig({
  base: '/echo_protocol/',
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL('../../echo_protocol', import.meta.url)),
    emptyOutDir: true,
    target: ['es2020', 'safari14'],
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 700, // one ~160 KB (gzip) bundle is fine for a single-page game
  },
});
