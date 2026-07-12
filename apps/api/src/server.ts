import Fastify, { type FastifyRequest } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { randomUUID } from 'node:crypto';
import { loadEnv, ok, fail } from '../../../packages/shared/src/index.js';
import { LocalJwtCompatibleAuthProvider, sessionRequestSchema, type AuthIdentity } from '../../../packages/auth/src/index.js';
import { assertRole, type Role } from '../../../packages/policy/src/index.js';
import { MemberService, memberSchema } from '../../../packages/members/src/index.js';
import { GovernanceService, proposalSchema, voteSchema } from '../../../packages/governance/src/index.js';
import { ProjectService, projectSchema } from '../../../packages/projects/src/index.js';
import { BountyService, bountySchema, submissionSchema } from '../../../packages/bounties/src/index.js';
import { TreasuryService } from '../../../packages/treasury/src/index.js';
import { InMemoryReceiptService, hashState } from '../../../packages/receipts/src/index.js';

declare module 'fastify' { interface FastifyRequest { requestId: string; user?: AuthIdentity } }
const auth = new LocalJwtCompatibleAuthProvider();
const members = new MemberService();
const governance = new GovernanceService();
const projects = new ProjectService();
const bounties = new BountyService();
const treasury = new TreasuryService();
const receipts = new InMemoryReceiptService();
const bodyOf = (request: FastifyRequest) => request.body as Record<string, unknown>;

export async function buildServer() {
  const env = loadEnv();
  const app = Fastify({ logger: { level: env.LOG_LEVEL, redact: ['req.headers.authorization', '*.password', '*.token', '*.secret', '*.privateKey'] }, genReqId: () => randomUUID() });
  await app.register(helmet);
  await app.register(cors, { origin: env.CORS_ORIGINS.split(',').map((origin) => origin.trim()) });
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
  app.addHook('onRequest', async (request) => { request.requestId = request.id; const header = request.headers.authorization; if (header?.startsWith('Bearer ')) request.user = (await auth.verifyToken(header.slice(7))) ?? undefined; });
  const requireRole = (role: Role) => async (request: FastifyRequest) => assertRole(request.user?.roles, role);
  const receipt = (request: FastifyRequest, action: string, resourceType: string, resourceId: string, status: 'SUCCESS'|'FAILURE', previous?: unknown, result?: unknown) => receipts.create({ actorId: request.user?.id ?? 'anonymous', action, resourceType, resourceId, requestId: request.requestId, status, previousStateHash: previous ? hashState(previous) : undefined, resultingStateHash: result ? hashState(result) : undefined });

  app.setErrorHandler((error, request, reply) => { const isValidation = error.name === 'ZodError'; const status = isValidation ? 400 : ((error as any).statusCode ?? 500); reply.status(status).send(fail(isValidation ? 'VALIDATION_ERROR' : ((error as any).code ?? (status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR')), status === 500 ? 'Unexpected server error.' : error.message, request.requestId)); });

  app.get('/api/v1/health', async (request) => ok({ status: 'ok' }, request.requestId));
  app.get('/api/v1/status', async (request) => ok({ service: 'KDAOcore API', version: '0.1.0' }, request.requestId));
  app.post('/api/v1/auth/session', async (request, reply) => { const session = await auth.createSession(sessionRequestSchema.parse(bodyOf(request))); return reply.send(ok(session, request.requestId)); });
  app.get('/api/v1/auth/me', { preHandler: requireRole('MEMBER') }, async (request) => ok(request.user, request.requestId));

  app.get('/api/v1/members', async (request) => ok(members.list(), request.requestId));
  app.get('/api/v1/members/:id', async (request) => ok(members.get((request.params as any).id), request.requestId));
  app.post('/api/v1/members', { preHandler: requireRole('OPERATOR') }, async (request) => { const member = members.create(memberSchema.parse(bodyOf(request))); receipt(request,'member.create','Member',member.id,'SUCCESS',undefined,member); return ok(member, request.requestId); });
  app.patch('/api/v1/members/:id', { preHandler: requireRole('OPERATOR') }, async (request) => { const id=(request.params as any).id; const before=members.get(id); const updated=members.update(id, memberSchema.partial().parse(bodyOf(request))); receipt(request,'member.update','Member',id,'SUCCESS',before,updated); return ok(updated, request.requestId); });

  app.get('/api/v1/proposals', async (request) => ok(governance.list(), request.requestId));
  app.get('/api/v1/proposals/:id', async (request) => ok(governance.get((request.params as any).id), request.requestId));
  app.post('/api/v1/proposals', { preHandler: requireRole('MEMBER') }, async (request) => { const proposal=governance.createProposal(proposalSchema.parse(bodyOf(request))); receipt(request,'proposal.create','Proposal',proposal.id,'SUCCESS',undefined,proposal); return ok(proposal, request.requestId); });
  app.patch('/api/v1/proposals/:id', { preHandler: requireRole('MODERATOR') }, async (request) => { const id=(request.params as any).id; const before=governance.get(id); const updated=governance.update(id, proposalSchema.partial().parse(bodyOf(request))); receipt(request,'proposal.update','Proposal',id,'SUCCESS',before,updated); return ok(updated, request.requestId); });
  app.post('/api/v1/proposals/:id/votes', { preHandler: requireRole('MEMBER') }, async (request) => { const id=(request.params as any).id; const vote=governance.vote(id, voteSchema.parse(bodyOf(request))); receipt(request,'proposal.vote','Proposal',id,'SUCCESS',undefined,vote); return ok(vote, request.requestId); });

  app.get('/api/v1/projects', async (request) => ok(projects.list(), request.requestId));
  app.get('/api/v1/projects/:id', async (request) => ok(projects.get((request.params as any).id), request.requestId));
  app.post('/api/v1/projects', { preHandler: requireRole('CONTRIBUTOR') }, async (request) => ok(projects.create(projectSchema.parse(bodyOf(request))), request.requestId));
  app.patch('/api/v1/projects/:id', { preHandler: requireRole('CONTRIBUTOR') }, async (request) => ok(projects.update((request.params as any).id, projectSchema.partial().parse(bodyOf(request))), request.requestId));
  app.get('/api/v1/bounties', async (request) => ok(bounties.list(), request.requestId));
  app.get('/api/v1/bounties/:id', async (request) => ok(bounties.get((request.params as any).id), request.requestId));
  app.post('/api/v1/bounties', { preHandler: requireRole('OPERATOR') }, async (request) => ok(bounties.create(bountySchema.parse(bodyOf(request))), request.requestId));
  app.post('/api/v1/bounties/:id/submissions', { preHandler: requireRole('CONTRIBUTOR') }, async (request) => ok(bounties.submit((request.params as any).id, submissionSchema.parse(bodyOf(request))), request.requestId));
  app.get('/api/v1/treasury/summary', async (request) => ok(treasury.summary(), request.requestId));
  app.get('/api/v1/treasury/transactions', async (request) => ok(treasury.listTransactions(Boolean(request.user?.roles.includes('OPERATOR'))), request.requestId));
  app.get('/api/v1/receipts', { preHandler: requireRole('OPERATOR') }, async (request) => ok(receipts.list(), request.requestId));
  app.get('/api/v1/receipts/:id', { preHandler: requireRole('OPERATOR') }, async (request) => ok(receipts.get((request.params as any).id), request.requestId));
  return app;
}
if (process.argv[1]?.endsWith('server.ts')) { const app = await buildServer(); await app.listen({ port: loadEnv().PORT, host: '0.0.0.0' }); }
