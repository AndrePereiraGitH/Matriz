import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev -w @matriz/api',
      url: 'http://localhost:3000/api/v1/auth/me',
      reuseExistingServer: !process.env.CI,
      timeout: 15_000,
    },
    {
      command: 'npm run dev -w @matriz/web',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 15_000,
    },
  ],
})
