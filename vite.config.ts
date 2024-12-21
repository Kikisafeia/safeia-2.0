import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true, 
    open: '/',
    proxy: {
      '/api/dify': {
        target: 'https://api.dify.ai/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/dify/, ''),
        headers: {
          'Origin': 'https://api.dify.ai'
        }
      },
      '/__/auth/handler': {
        target: 'https://safeia-2.firebaseapp.com',
        changeOrigin: true,
        secure: false,
        headers: {
          'Origin': 'https://safeia-2.firebaseapp.com'
        }
      },
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    },
    cors: {
      origin: [
        'https://safeia-2.firebaseapp.com',
        'https://safeia-2.web.app',
        'http://localhost:3000'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
