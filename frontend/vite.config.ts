import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: API_BASE,
        changeOrigin: true,
      },
    },
  },
});
