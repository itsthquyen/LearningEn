import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: Number(env.FRONTEND_PORT || 5173),
      proxy: { '/api': { target: env.BACKEND_URL || 'http://localhost:8080', changeOrigin: true } },
    },
    test: { environment: 'jsdom', setupFiles: './src/test/setup.js' },
  };
});
