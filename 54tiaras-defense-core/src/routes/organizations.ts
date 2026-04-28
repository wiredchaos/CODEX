import type { FastifyInstance } from 'fastify';
import { prisma } from '../db.js';
import { requireRole } from '../middleware/rbac.js';
import { writeAuditLog } from '../services/auditLog.js';
import { OrganizationCreateSchema, OrganizationIdParamsSchema } from '../schemas/organizations.js';

export async function organizationsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [requireRole('admin')],
      schema: {
        body: OrganizationCreateSchema
      }
    },
    async (req, reply) => {
      const body = OrganizationCreateSchema.parse(req.body);
      const org = await prisma.organization.create({
        data: { name: body.name }
      });

      await writeAuditLog({
        orgId: org.id,
        actorApiKeyId: req.auth?.apiKeyId,
        actorUserId: req.auth?.userId,
        action: 'org.create',
        targetType: 'Organization',
        targetId: org.id,
        request: req,
        metadata: { name: org.name }
      });

      return reply.code(201).send({ organization: org });
    }
  );

  app.get(
    '/:id',
    {
      preHandler: [requireRole('viewer')],
      schema: {
        params: OrganizationIdParamsSchema
      }
    },
    async (req, reply) => {
      const params = OrganizationIdParamsSchema.parse(req.params);
      const org = await prisma.organization.findUnique({ where: { id: params.id } });
      if (!org) return reply.code(404).send({ error: 'Not found' });
      return reply.send({ organization: org });
    }
  );
}

