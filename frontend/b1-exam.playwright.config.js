import { defineConfig } from '@playwright/test';
import verification from './verification.playwright.config.js';

export default defineConfig({ ...verification, testMatch: '**/b1-exam.pw.js' });
