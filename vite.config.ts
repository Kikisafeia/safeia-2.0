import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/dify': {
        target: 'https://api.dify.ai/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/dify/, ''),
        headers: {
          'Origin': 'https://api.dify.ai'
        }
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
