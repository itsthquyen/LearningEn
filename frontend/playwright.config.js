import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', fullyParallel: false, workers: 1, timeout: 45000,
  reporter: [['list'], ['json', { outputFile: '../work/e2e/results.json' }]],
  use: { baseURL: process.env.E2E_FRONTEND_URL, screenshot: 'only-on-failure', trace: 'retain-on-failure', headless: true,
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {} },
  outputDir: '../work/e2e/artifacts',
});
