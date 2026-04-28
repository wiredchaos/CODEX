import type { FastifyReply, FastifyRequest } from 'fastify';

type AuthRole = NonNullable<FastifyRequest['auth']>['role'];
type RoleRank = Record<AuthRole, number>;

const RANK: RoleRank = {
  OWNER: 4,
  ADMIN: 3,
  ANALYST: 2,
  READONLY: 1,
};

export type RequiredRole = 'viewer' | 'analyst' | 'admin' | 'owner';

const REQUIRED_TO_RANK: Record<RequiredRole, number> = {
  viewer: RANK.READONLY,
  analyst: RANK.ANALYST,
  admin: RANK.ADMIN,
  owner: RANK.OWNER,
};

export function requireRole(required: RequiredRole) {
  const minRank = REQUIRED_TO_RANK[required];

  return async function rbacGuard(req: FastifyRequest, reply: FastifyReply) {
    const auth = req.auth;
    if (!auth) return reply.code(401).send({ error: 'unauthorized' });
    if ((RANK[auth.role] ?? 0) < minRank) return reply.code(403).send({ error: 'forbidden' });
  };
}

export async function registerRbac(_app: unknown) {
  // Placeholder: RBAC currently enforced per-route via `requireRole()`.
  // This hook exists to match the server wiring and allow future global policy wiring.
}

