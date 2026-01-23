import { z } from 'zod';

export const SubsystemEnum = z.enum([
  'CHAOS_OS',
  'NPC',
  'AKIRA_CODEX',
  'CREATOR_CODEX',
  'FEN',
  'TAX_SUITE',
  'TRUST_SUITE',
  'OTHER',
]);

export const SurfaceEnum = z.enum([
  'backend',
  'frontend',
  'prompts',
  'remotion',
  'infra',
  'docs',
]);

export const ChangeTypeEnum = z.enum([
  'feature',
  'fix',
  'refactor',
  'integration',
  'security',
  'performance',
  'content',
]);

export const RiskLevelEnum = z.enum(['none', 'low', 'medium', 'high']);
export const BlastRadiusEnum = z.enum([
  'single_module',
  'subsystem',
  'multi_subsystem',
]);

export const PRSchema = z.object({
  pr_id: z.string().regex(/^WC-PR-\d{8}-\d{4}$/),
  title: z.string().min(1),
  intent: z.string().min(1),
  target: z.object({
    subsystem: SubsystemEnum,
    module: z.string().min(1),
    surface: SurfaceEnum,
  }),
  change_type: ChangeTypeEnum,
  constraints: z.object({
    must_not: z.array(z.string()).default([]),
    must: z.array(z.string()).default([]),
    style: z.array(z.string()).default([]),
    security: z.array(z.string()).default([]),
  }),
  inputs: z
    .object({
      links: z.array(z.string()).default([]),
      files: z.array(z.string()).default([]),
      context_artifacts: z.array(z.string()).default([]),
    })
    .optional()
    .default({ links: [], files: [], context_artifacts: [] }),
  acceptance_tests: z.array(z.string()).min(1),
  risk: z.object({
    data_access: RiskLevelEnum,
    blast_radius: BlastRadiusEnum,
    user_impact: RiskLevelEnum,
  }),
  deliverables: z.array(z.string()).min(1),
  rollback_plan: z.string().optional(),
  owner: z.string().min(1),
  timestamp: z.string().datetime(),
});

export type PRObject = z.infer<typeof PRSchema>;

export const createPR = (input: unknown): PRObject => {
  return PRSchema.parse(input);
};
