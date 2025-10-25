import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@renegade/convex': path.resolve(
        __dirname,
        '../../packages/backend/convex'
      ),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
