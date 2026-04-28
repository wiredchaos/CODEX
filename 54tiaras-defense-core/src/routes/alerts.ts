import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

import { prisma } from '../db.js';
import { requireRole } from '../middleware/rbac.js';
import { zodValidate } from '../utils/zodValidate.js';

const PatchStatusBody = z.object({
  status: z.enum(['open', 'investigating', 'mitigated', 'accepted_risk', 'false_positive']),
});

export const alertsRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/alerts',
    {
      preHandler: [requireRole('viewer')],
    },
    async (req) => {
      const orgId = req.auth!.orgId;
      const alerts = await prisma.alert.findMany({
        where: { organizationId: orgId },
        orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
        take: 200,
      });
      return { alerts };
    }
  );

  app.patch(
    '/alerts/:id/status',
    {
      preHandler: [requireRole('analyst')],
    },
    async (req) => {
      const orgId = req.auth!.orgId;
      const id = String((req.params as any).id);
      const body = zodValidate(PatchStatusBody, req.body);
      const updated = await prisma.alert.update({
        where: { id, organizationId: orgId },
        data: { status: body.status },
      });
      return { alert: updated };
    }
  );
};

