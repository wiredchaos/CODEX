import { z } from 'zod';

export const WorldSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  tokenMatch: z.string(), // Membership rule
  status: z.enum(['active', 'drift', 'archived']).default('active'),
});

export const PatchSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  version: z.string(),
  canonical: z.boolean().default(true),
  worldId: z.string().optional(),
});

export const TimelineEventSchema = z.object({
  timestamp: z.string().datetime(),
  type: z.string(),
  description: z.string(),
  metadata: z.record(z.any()).optional(),
});

export type World = z.infer<typeof WorldSchema>;
export type Patch = z.infer<typeof PatchSchema>;
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
