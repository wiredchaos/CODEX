import type { FastifyInstance } from 'fastify';
import { requireRole } from '../middleware/rbac.js';
import { validateWebhookBodySchema } from '../schemas/webhooks.js';
import { validateWebhookDestination } from '../services/webhook/webhookValidator.js';
import { writeAuditLog } from '../services/auditLog.js';

export async function webhooksRoutes(app: FastifyInstance) {
  app.post(
    '/validate',
    {
      preHandler: [requireRole('admin')],
    },
    async (req, reply) => {
      const body = validateWebhookBodySchema.parse(req.body);

      const result = await validateWebhookDestination({
        url: body.url,
        allowlistHosts: body.allowlist ?? [],
      });

      await writeAuditLog({
        orgId: body.organizationId,
        actorApiKeyId: req.auth!.apiKeyId,
        action: 'webhook.validate',
        targetType: 'WebhookEndpoint',
        targetId: null,
        request: req,
        metadata: { url: body.url, ...result },
      });

      return reply.send(result);
    }
  );
}

