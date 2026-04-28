import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

import { requireRole } from '../middleware/rbac.js';
import { RepoSecretsScanBodySchema, RepoSecretsScanParamsSchema } from '../schemas/scans.js';
import { scanForSecrets } from '../services/scanning/secretScanner.js';

export const scansRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/repos/:repoId/secrets',
    {
      preHandler: [requireRole('analyst')],
    },
    async (req, reply) => {
      const repoId = RepoSecretsScanParamsSchema.parse(req.params).repoId;
      const body = z
        .object({
          // In this scaffold we accept raw content; production wiring would fetch via GitHub.
          content: z.string().min(1).max(5_000_000),
          filePath: z.string().optional(),
        })
        .parse(req.body);

      const findings = scanForSecrets({ content: body.content, filePath: body.filePath }).map((f) => ({
        ...f,
        repoId,
      }));

      return reply.send({ repoId, findings });
    }
  );

  app.post(
    '/bundles',
    {
      preHandler: [requireRole('analyst')],
    },
    async (_req, reply) => {
      return reply.status(501).send({ error: 'Not implemented' });
    }
  );
};

