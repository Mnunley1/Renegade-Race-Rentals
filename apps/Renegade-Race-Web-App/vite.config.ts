import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      external: ['convex/server'],
    },
  },
  define: {
    'convex/server': '{}',
  },
  optimizeDeps: {
    include: ['convex/react'],
  },
  server: {
    fs: {
      allow: ['../..'], // allow workspace packages
    },
  },
});
