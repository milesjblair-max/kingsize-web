/**
 * Vitest configuration for unit tests
 */
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["tests/unit/**/*.test.ts"],
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            "@kingsize/contracts": path.resolve(__dirname, "packages/contracts/src/index.ts"),
        },
    },
});
