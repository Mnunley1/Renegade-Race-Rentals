import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'replace-convex-server',
      resolveId(id) {
        if (id === 'convex/server') {
          return id;
        }
      },
      load(id) {
        if (id === 'convex/server') {
          return 'export {};';
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
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
