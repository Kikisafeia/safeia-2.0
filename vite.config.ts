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
      // Proxy más específico para /api/dify PRIMERO
      '/api/dify': { 
        target: 'https://api.dify.ai/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/dify/, ''),
        headers: {
          'Origin': 'https://api.dify.ai'
        }
      },
      // Proxy general para todas las demás llamadas /api/... al backend
      '/api': {
        target: 'http://127.0.0.1:3001', // Tu servidor backend
        changeOrigin: true, // Necesario para hosts virtuales
        secure: false,      // No verificar SSL si el backend es http
      },
      '/__/auth/handler': {
        target: 'https://safeia-2.firebaseapp.com',
        changeOrigin: true,
        secure: false,
        headers: {
          'Origin': 'https://safeia-2.firebaseapp.com'
        }
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
