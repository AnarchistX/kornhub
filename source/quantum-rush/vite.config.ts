import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During development the build stays in ./dist; at launch it is pointed at the site's /quantum-rush/ folder.
export default defineConfig({
  base: '/quantum-rush/',
  plugins: [react()],
  build: {
    outDir: process.env.QR_OUT ?? 'dist',
    emptyOutDir: true,
    target: ['es2020', 'safari14'],
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 700,
  },
});
