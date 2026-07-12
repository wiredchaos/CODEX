import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.string().default('info'),
  DATABASE_URL: z.string().min(1).default('postgresql://kdao:kdao@localhost:5432/kdaocore'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  AUTH_JWT_ISSUER: z.string().default('kdaocore-local'),
  AUTH_JWT_AUDIENCE: z.string().default('kdaocore'),
  CONTRACT_ENVIRONMENT: z.string().default('local')
});
export type Env = z.infer<typeof envSchema>;
export const loadEnv = (input = process.env): Env => envSchema.parse(input);
export type JsonEnvelope<T> = { success: boolean; data: T | null; error: null | { code: string; message: string }; requestId: string };
export const ok = <T>(data: T, requestId: string): JsonEnvelope<T> => ({ success: true, data, error: null, requestId });
export const fail = (code: string, message: string, requestId: string): JsonEnvelope<null> => ({ success: false, data: null, error: { code, message }, requestId });
export const redact = (value: unknown) => JSON.stringify(value, (key, val) => /secret|token|key|password|seed|private/i.test(key) ? '[REDACTED]' : val);
