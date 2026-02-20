import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests",
    outputDir: "./tests/results",
    snapshotDir: "./tests/screenshots",
    fullyParallel: false,
    retries: 0,
    reporter: [["list"], ["html", { outputFolder: "tests/report", open: "never" }]],
    use: {
        baseURL: "http://localhost:3000",
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    // Don't start a server — assumes `npm run dev` is already running
    webServer: undefined,
});
