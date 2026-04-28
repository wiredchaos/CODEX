import { z } from 'zod';

export const RepoSecretsScanParamsSchema = z.object({
  repoId: z.string().uuid()
});

export const RepoSecretsScanRequestSchema = z.object({
  params: RepoSecretsScanParamsSchema,
  body: z.object({
    orgId: z.string().uuid(),
    content: z.string().min(1).max(5_000_000),
    sourceHint: z.string().optional(),
  }),
});

export const RepoSecretsScanBodySchema = z.object({
  // Optional GitHub clone URL or local checkout hint for offline scanners.
  // In production you’d fetch via GitHub API + archive download.
  source: z
    .object({
      kind: z.enum(['github', 'local']).default('github'),
      github: z
        .object({
          owner: z.string().min(1),
          repo: z.string().min(1),
          ref: z.string().min(1).default('HEAD')
        })
        .optional(),
      localPath: z.string().min(1).optional()
    })
    .optional(),
  options: z
    .object({
      // Default conservative scanning settings.
      maxFileBytes: z.number().int().positive().default(2_000_000),
      maxFiles: z.number().int().positive().default(10_000)
    })
    .optional()
});

export const BundleScanBodySchema = z.object({
  url: z.string().url(),
  // If provided, the platform will store only redacted excerpts and hashes.
  orgId: z.string().uuid().optional()
});

