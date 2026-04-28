import type { FastifyRequest } from 'fastify';
import { z } from 'zod';
import { redactObject } from '../utils/redact.js';
import { config } from '../config.js';
import { sha256Hex, timingSafeEqualHex } from '../utils/crypto.js';
import { prisma } from '../db.js';

const headerSchema = z.object({
  'x-api-key': z.string().min(1).optional(),
  authorization: z.string().min(1).optional()
});

export type AuthContext = {
  apiKeyId: string;
  orgId: string;
  role: 'OWNER' | 'ADMIN' | 'ANALYST' | 'READONLY';
  userId?: string;
};

declare module 'fastify' {
  interface FastifyRequest {
    auth?: AuthContext;
    org?: { id: string };
  }
}

function parseApiKey(req: FastifyRequest): string | null {
  const h = headerSchema.safeParse(req.headers);
  if (!h.success) return null;
  const apiKey = h.data['x-api-key'] ?? null;
  // Authorization bearer is allowed for future user auth; not implemented here.
  return apiKey;
}

function toRole(input: string): AuthContext['role'] {
  const up = input.toUpperCase();
  if (up === 'OWNER') return 'OWNER';
  if (up === 'ADMIN') return 'ADMIN';
  if (up === 'ANALYST') return 'ANALYST';
  return 'READONLY';
}

export function requireAdminApiKey() {
  return async function adminApiKeyGuard(req: FastifyRequest) {
    const apiKey = parseApiKey(req);
    if (!apiKey) {
      req.log.warn({ headers: redactObject(req.headers) }, 'missing_api_key');
      const err = new Error('Unauthorized');
      (err as any).statusCode = 401;
      throw err;
    }

    // Production: accept either the configured ADMIN_API_KEY (single-tenant bootstrap)
    // or an org-scoped ApiKey row (multi-tenant). We never store raw keys: compare by hash.
    const raw = apiKey.trim();
    const keyHash = sha256Hex(raw);

    // Bootstrap path (no DB required)
    if (timingSafeEqualHex(sha256Hex(config.ADMIN_API_KEY), keyHash)) {
      // default bootstrap org id must be provided by caller on each request
      // via `x-org-id` header for isolation.
      const orgId = String((req.headers['x-org-id'] as string | undefined) ?? '');
      if (!orgId) {
        const err = new Error('x-org-id required');
        (err as any).statusCode = 400;
        throw err;
      }
      req.auth = { apiKeyId: 'bootstrap', orgId, role: 'OWNER' };
      req.org = { id: orgId };
      return;
    }

    // DB lookup path
    const row = await prisma.apiKey.findFirst({
      where: { keyHash, active: true },
      select: { id: true, organizationId: true, role: true },
    });
    if (!row) {
      const err = new Error('Unauthorized');
      (err as any).statusCode = 401;
      throw err;
    }
    req.auth = { apiKeyId: row.id, orgId: row.organizationId, role: toRole(row.role) };
    req.org = { id: row.organizationId };
  };
}

export async function registerAuth(app: { addHook: (name: 'preHandler', fn: any) => void }) {
  app.addHook('preHandler', requireAdminApiKey());
}

