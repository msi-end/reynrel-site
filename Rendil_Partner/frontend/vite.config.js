import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const api = process.env.API_URL || 'http://localhost:5100';

export default defineConfig({
  plugins: [react()],
  server: { port: 5180, proxy: { '/api': api, '/uploads': api } },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('lucide-react')) return 'icons';
          return 'vendor';
        }
      }
    }
  }
});
