import { z } from 'zod';

export const validateWebhookBodySchema = z.object({
  organizationId: z.string().uuid(),
  url: z.string().url(),
  method: z.enum(['POST', 'PUT', 'PATCH', 'DELETE']).default('POST'),
  allowlist: z.array(z.string().min(1)).optional(),
});

export type WebhookValidationInput = z.infer<typeof validateWebhookBodySchema>;

export type WebhookValidationResult = {
  verdict: 'allow' | 'deny';
  score: number;
  reasons: string[];
  resolvedIps?: string[];
};

