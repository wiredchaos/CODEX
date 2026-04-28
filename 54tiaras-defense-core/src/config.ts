import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),

  /**
   * Master key used for bootstrap operations only (e.g. initial org creation).
   * This key must never be stored in the database.
   */
  ADMIN_API_KEY: z.string().min(16),

  /**
   * Comma-separated allowlist of CORS origins. Leave empty to allow only same-origin and no-origin requests.
   * Example: "https://console.54tiaras.com,https://staging-console.54tiaras.com"
   */
  CORS_ALLOWLIST: z.string().optional(),

  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Git Shield (optional configuration)
  GITHUB_APP_ID: z.string().optional(),
  GITHUB_APP_PRIVATE_KEY_BASE64: z.string().optional(),
  GITHUB_INSTALLATION_ID: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
});

export type AppConfig = z.infer<typeof envSchema> & {
  corsAllowlist: string[];
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => `${i.path.join('.') || 'env'}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment:\n${message}`);
  }

  const corsAllowlist =
    parsed.data.CORS_ALLOWLIST?.split(',')
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  return {
    ...parsed.data,
    corsAllowlist,
  };
}

export const config: AppConfig = loadConfig();
export const getConfig = () => config;

