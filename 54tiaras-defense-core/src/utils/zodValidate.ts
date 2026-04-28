import { z } from 'zod';

export function zodValidate<T extends z.ZodTypeAny>(schema: T, value: unknown): z.infer<T> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const err = new Error('Invalid request');
    (err as any).statusCode = 400;
    (err as any).issues = parsed.error.issues;
    throw err;
  }
  return parsed.data;
}

