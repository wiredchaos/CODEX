import { z } from 'zod';

export const OrganizationCreateSchema = z.object({
  name: z.string().min(2).max(120),
});

export const OrganizationIdParamsSchema = z.object({
  id: z.string().uuid(),
});

