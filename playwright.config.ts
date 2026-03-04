import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests",
    outputDir: "./tests/results",
    snapshotDir: "./tests/screenshots",
    fullyParallel: false,
    retries: process.env.CI ? 2 : 0,
    reporter: [["list"], ["html", { outputFolder: "tests/report", open: "never" }]],
    use: {
        baseURL: "http://localhost:3000",
        trace: "on-first-retry",
    },

    // ─── Automatically start the dev server before tests run ─────────────────
    // No more manual `npm run dev` required before running tests.
    webServer: {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },

    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
        // ─── Mobile emulation — catches responsive regressions ────────────────
        {
            name: "mobile-chrome",
            use: { ...devices["Pixel 5"] },
        },
    ],
});
