import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  timeout: 45000,
  retries: 0,
  reporter: [["list"]],
  outputDir: "test-results",
  use: {
    headless: true,
    trace: "retain-on-failure",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : {},
  },
  projects: [
    {
      name: "local-desktop",
      testMatch: "local.spec.ts",
      use: {
        baseURL: "http://127.0.0.1:3121",
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "local-mobile",
      testMatch: "local.spec.ts",
      use: {
        baseURL: "http://127.0.0.1:3121",
        viewport: { width: 390, height: 900 },
      },
    },
    {
      name: "api-desktop",
      testMatch: "api.spec.ts",
      use: {
        baseURL: "http://127.0.0.1:3122",
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "api-mobile",
      testMatch: "api.spec.ts",
      use: {
        baseURL: "http://127.0.0.1:3122",
        viewport: { width: 390, height: 900 },
      },
    },
  ],
  webServer: [
    {
      command: "node node_modules/tsx/dist/cli.mjs tests/mock-storefront.ts",
      url: "http://127.0.0.1:3120/__fixture/status",
      reuseExistingServer: false,
    },
    {
      command: "node node_modules/next/dist/bin/next start -p 3121",
      url: "http://127.0.0.1:3121",
      env: { COMMERCE_DATA_SOURCE: "local" },
      reuseExistingServer: false,
    },
    {
      command: "node node_modules/next/dist/bin/next start -p 3122",
      url: "http://127.0.0.1:3122",
      env: {
        COMMERCE_DATA_SOURCE: "api",
        COMMERCE_API_BASE_URL: "http://127.0.0.1:3120",
        COMMERCE_API_TOKEN: "fixture-private-token",
      },
      reuseExistingServer: false,
    },
  ],
});
