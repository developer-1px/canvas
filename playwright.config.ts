import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  expect: {
    timeout: 5000,
  },
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
  ],
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  use: {
    baseURL: 'http://127.0.0.1:53175',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm exec vite --force --host 127.0.0.1 --port 53175',
    reuseExistingServer: !process.env.CI,
    url: 'http://127.0.0.1:53175',
  },
})
