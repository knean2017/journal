import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://localhost:3100', trace: 'on-first-retry' },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 } },
    },
  ],
  /**
   * Its own port and its own server, never a reused one: a server left running
   * from an earlier build silently tests the wrong code, which has already
   * happened here. CONTENT_SOURCE=seed pins the fixtures, so editing content in
   * the admin cannot turn the suite red.
   */
  webServer: {
    command: 'npm start -- --port 3100',
    url: 'http://localhost:3100',
    env: { CONTENT_SOURCE: 'seed' },
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
