/**
 * Environment variable validation (Zod)
 * Imported at app startup (layout.tsx or instrumentation.ts).
 * Build fails fast if required vars are missing or wrong type.
 *
 * Usage: import { env } from "@/lib/env";
 */
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // LLM provider — optional in dev, required in production if not using fallback
    LLM_PROVIDER: z.enum(["groq", "huggingface", "fallback"]).default("fallback"),
    GROQ_API_KEY: z.string().optional(),
    HUGGINGFACE_API_KEY: z.string().optional(),

    // Integration provider — defaults to mock for local dev
    INTEGRATION_PROVIDER: z.enum(["mock", "counterintelligence"]).default("mock"),
    CI_API_URL: z.string().url().optional(),
    CI_API_KEY: z.string().optional(),

    // Toggle mock catalog vs real Counter Intelligence POS data
    MOCK_CI_ENABLED: z
        .string()
        .transform((v) => v === "true" || v === "1")
        .default("true"),
});

// Parse and export — will throw at startup if required keys are invalid
export const env = envSchema.parse(process.env);
