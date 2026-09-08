import { z } from "zod";

/**
 * Define the schema for server-side environment variables.
 * These are validated at build/startup time and never exposed to the client.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().url().optional(),
  API_BASE_URL: z.string().url().default("http://localhost:5000/api/v1"),
  BACKEND_URL: z.string().url().default("http://localhost:5000"),
  API_SECRET_KEY: z.string().min(1).optional(),
});

/**
 * Define the schema for client-side environment variables.
 * These MUST be prefixed with NEXT_PUBLIC_ to be available in the browser.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url()
    .default("http://localhost:5000/api/v1"),
  NEXT_PUBLIC_BACKEND_URL: z
    .string()
    .url()
    .default("http://localhost:5000"),
});

/**
 * Merge server + client schemas for a unified validation pass.
 */
const envSchema = serverEnvSchema.merge(clientEnvSchema);

export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate all environment variables.
 * This runs once on import — any misconfiguration will throw immediately
 * with a detailed Zod error listing every invalid/missing field.
 */
function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error(
      "Invalid environment variables. Check the server logs for details.",
    );
  }

  return parsed.data;
}

export const env = validateEnv();
