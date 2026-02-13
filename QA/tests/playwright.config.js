// @ts-check
const { defineConfig } = require('@playwright/test');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '..', 'logs');

module.exports = defineConfig({
  testDir: '.',
  testMatch: '*.spec.js',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 30000,
  expect: { timeout: 5000 },

  reporter: [
    ['list'],
    ['json', { outputFile: path.join(LOGS_DIR, 'test-results.json') }],
    ['html', { outputFolder: path.join(LOGS_DIR, 'html-report'), open: 'never' }],
  ],

  use: {
    baseURL: 'http://localhost:8080',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 800 },
      },
    },
  ],

  webServer: {
    command: 'python3 -m http.server 8080',
    cwd: path.join(__dirname, '..', '..'),
    port: 8080,
    reuseExistingServer: true,
    timeout: 10000,
  },
});
