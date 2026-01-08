
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    allowedHosts: [
      'subacute-killian-understatedly.ngrok-free.dev',
      '.ngrok-free.dev',
      'localhost',
      '127.0.0.1'
    ],
    proxy: {
      '/login': 'http://127.0.0.1:5000',
      '/signup': 'http://127.0.0.1:5000',
      '/doctor': 'http://127.0.0.1:5000',
      '/worker': 'http://127.0.0.1:5000',
      '/admin': 'http://127.0.0.1:5000',
    }
  }
});
