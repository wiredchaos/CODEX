import { z } from 'zod';

// World schemas
export const WorldSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  tokens: z.array(z.string()), // e.g., ["3DT", "AKIRA_CODEX"]
  metadata: z.record(z.any()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type World = z.infer<typeof WorldSchema>;

export const CreateWorldSchema = WorldSchema.omit({ createdAt: true, updatedAt: true });
export type CreateWorld = z.infer<typeof CreateWorldSchema>;

// Patch schemas
export const PatchSchema = z.object({
  id: z.string(),
  worldId: z.string(),
  invariant: z.string(), // The core rule/invariant this patch enforces
  scope: z.string(), // What area of the system this applies to
  enforcement: z.string(), // How the invariant is enforced
  observableEffects: z.string(), // What observable effects this patch has
  metadata: z.record(z.any()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type Patch = z.infer<typeof PatchSchema>;

export const CreatePatchSchema = PatchSchema.omit({ createdAt: true, updatedAt: true });
export type CreatePatch = z.infer<typeof CreatePatchSchema>;

// TimelineEvent schemas
export const TimelineEventSchema = z.object({
  id: z.string().optional(),
  worldId: z.string(),
  eventType: z.string(), // e.g., "PATCH_APPLIED", "WORLD_CREATED", "ARTIFACT_MATCHED"
  patchId: z.string().optional(),
  description: z.string(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.date().optional()
});

export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

export const CreateTimelineEventSchema = TimelineEventSchema.omit({ id: true, timestamp: true });
export type CreateTimelineEvent = z.infer<typeof CreateTimelineEventSchema>;

// Query schemas
export const GetPatchesQuerySchema = z.object({
  world: z.string().optional()
});

export const GetTimelineQuerySchema = z.object({
  world: z.string().optional()
});
