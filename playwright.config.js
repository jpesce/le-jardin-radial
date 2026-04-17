import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/results',
  timeout: 30000,
  snapshotPathTemplate: '{testDir}/snapshots-{platform}/{arg}{ext}',
  expect: {
    toHaveScreenshot: { maxDiffPixels: 100, threshold: 0.2 },
  },
  use: {
    baseURL: 'http://localhost:5174',
    browserName: 'chromium',
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'pnpm dev --port 5174',
    port: 5174,
    reuseExistingServer: true,
  },
});
