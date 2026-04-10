import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  snapshotPathTemplate: '{testDir}/snapshots/{arg}{ext}',
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.03 },
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
