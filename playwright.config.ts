import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  expect: {
    timeout: 5000,
  },
  reporter: process.env.CI
    ? [['line'], ['html', { open: 'never' }]]
    : 'list',
  retries: process.env.CI ? 1 : 0,
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: {
          height: 900,
          width: 1600,
        },
      },
    },
    {
      name: 'webkit',
      testMatch: '**/canvas-native-gesture-ownership.e2e.ts',
      use: {
        ...devices['Desktop Safari'],
        viewport: {
          height: 900,
          width: 1600,
        },
      },
    },
  ],
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  use: {
    baseURL: 'http://127.0.0.1:53175',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm exec vite --force --host 127.0.0.1 --port 53175',
    reuseExistingServer: !process.env.CI,
    url: 'http://127.0.0.1:53175',
  },
})
