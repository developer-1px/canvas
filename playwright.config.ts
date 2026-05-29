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
      },
    },
  ],
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  use: {
    baseURL: 'http://127.0.0.1:53173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm exec vite --force --host 127.0.0.1 --port 53173',
    reuseExistingServer: false,
    url: 'http://127.0.0.1:53173',
  },
})
