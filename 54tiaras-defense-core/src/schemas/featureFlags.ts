import { z } from 'zod';

export const FeatureFlagScanRequestSchema = z.object({
  orgId: z.string().uuid(),
  source: z.object({
    provider: z.enum(['launchdarkly', 'split', 'unleash', 'custom']).default('custom'),
    environment: z.string().min(1).default('unknown'),
    fetchedAt: z.string().datetime().optional(),
  }),
  flags: z
    .array(
      z.object({
        key: z.string().min(1),
        raw: z.any(),
      })
    )
    .min(1),
});

export type FeatureFlagScanRequest = z.infer<typeof FeatureFlagScanRequestSchema>;

