import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  // Sur GitHub Actions : un essai de plus (machines plus lentes) et un rapport HTML à télécharger en cas d'échec.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  // Les tests se font en français par défaut ; les tests de la version anglaise le demandent (R-60).
  use: { baseURL: `http://localhost:${PORT}/`, locale: "fr-CA" },
  webServer: {
    command: `pnpm build && pnpm preview --port ${PORT} --strictPort`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: "telephone", use: { ...devices["Pixel 7"], viewport: { width: 360, height: 740 } } },
    { name: "ordinateur", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
  ],
});
