import { randomUUID } from 'node:crypto';
import { defineConfig } from '@playwright/test';

const backendPort = Number(process.env.VERIFY_BACKEND_PORT || 15180);
const frontendPort = Number(process.env.VERIFY_FRONTEND_PORT || 15173);
process.env.VERIFY_EMAIL ||= `${randomUUID()}@example.com`;
process.env.VERIFY_PASSWORD ||= randomUUID();

export default defineConfig({
  testDir: './verification/e2e',
  testMatch: '**/*.pw.js',
  workers: 1,
  timeout: 60000,
  reporter: 'list',
  outputDir: './test-results/verification',
  use: {
    baseURL: `http://127.0.0.1:${frontendPort}`,
    channel: process.env.VERIFY_BROWSER_CHANNEL || 'msedge',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'rtk proxy java -jar target/learningen-backend-0.0.1-SNAPSHOT.jar',
      cwd: '../backend',
      url: `http://127.0.0.1:${backendPort}/api/v1/auth/csrf`,
      timeout: 120000,
      reuseExistingServer: false,
      env: {
        SPRING_PROFILES_ACTIVE: 'dev',
        BACKEND_PORT: String(backendPort),
        SPRING_DATASOURCE_URL: `jdbc:h2:mem:verification-${randomUUID()};MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1`,
        SPRING_DATASOURCE_USERNAME: 'sa',
        SPRING_DATASOURCE_PASSWORD: '',
        BOOTSTRAP_EMAIL: process.env.VERIFY_EMAIL,
        BOOTSTRAP_PASSWORD: process.env.VERIFY_PASSWORD,
        COOKIE_SECURE: 'false',
        CORS_ORIGINS: `http://127.0.0.1:${frontendPort}`,
        AI_BASE_URL: '',
        AI_API_KEY: '',
        AI_MODEL: '',
      },
    },
    {
      command: `rtk npm run dev -- --host 127.0.0.1 --port ${frontendPort} --strictPort`,
      url: `http://127.0.0.1:${frontendPort}`,
      timeout: 60000,
      reuseExistingServer: false,
      env: {
        BACKEND_URL: `http://127.0.0.1:${backendPort}`,
        VITE_API_BASE_URL: '/api/v1',
      },
    },
  ],
});
