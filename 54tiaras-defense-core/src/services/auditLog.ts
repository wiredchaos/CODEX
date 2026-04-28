import type { FastifyRequest } from 'fastify';
import { prisma } from '../db.js';
import { redactObject } from '../utils/redact.js';

export async function writeAuditLog(args: {
  orgId: string;
  actorUserId?: string;
  actorApiKeyId?: string;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  request?: FastifyRequest;
  metadata?: Record<string, unknown>;
}) {
  const requestId = args.request?.id as string | undefined;

  return prisma.auditLog.create({
    data: {
      organizationId: args.orgId,
      actorUserId: args.actorUserId,
      actorApiKeyId: args.actorApiKeyId,
      requestId: requestId ?? `req_${Date.now()}`,
      action: args.action,
      targetType: args.targetType ?? null,
      targetId: args.targetId ?? null,
      metadata: redactObject(args.metadata ?? {}) as any,
    },
  });
}

