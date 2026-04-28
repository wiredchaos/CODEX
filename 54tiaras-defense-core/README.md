# 54tiaras-defense-core

Production-grade **defensive** backend platform for “54Tiaras”.

**Doctrine**
- Compliance is a snapshot.
- Telemetry is memory.
- Evidence is armor.
- The swarm is survival.

## Non-goals (hard constraints)
- No exploit code.
- No weaponized payloads.
- No offensive scanning or intrusion.
- No storage of raw secrets or raw tokens.

## Stack
- Node.js 20 + TypeScript
- Fastify
- PostgreSQL + Prisma
- Redis + BullMQ
- Zod validation (every request)
- Octokit (GitHub integrations)
- pino logging
- vitest tests
- Docker Compose

## Setup

### 1) Install dependencies

```bash
cd 54tiaras-defense-core
npm install
```

### 2) Configure environment

Copy `.env.example` to `.env` and fill in values.

### 3) Start infrastructure

```bash
docker compose up -d
```

### 4) Prisma migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5) Run the API

```bash
npm run dev
```

### 6) Run tests

```bash
npm test
```

## API endpoints (core)
- `GET /health`
- `POST /organizations`
- `GET /organizations/:id`
- `POST /github/:orgId/sync` (stubbed for now)
- `POST /github/:orgId/check-enterprise-version` (service-level logic included)
- `POST /github/:orgId/ingest-audit-events` (stubbed for now)
- `POST /scans/repos/:repoId/secrets`
- `POST /scans/bundles` (stubbed for now)
- `POST /feature-flags/scan`
- `POST /webhooks/validate`
- `POST /vendors` (stubbed for now)
- `POST /vendors/:id/assess` (stubbed for now)
- `GET /alerts`
- `PATCH /alerts/:id/status`
- `POST /evidence` (stubbed for now)
- `GET /reports/:orgId/executive-summary` (stubbed for now)

## API examples

### Health

```bash
curl -s http://localhost:8787/health | jq
```

### Create organization

```bash
curl -s -X POST http://localhost:8787/organizations \
  -H 'content-type: application/json' \
  -H 'x-admin-api-key: dev-admin-key' \
  -d '{"name":"Acme Corp"}' | jq
```

### Validate webhook destination (defensive)

```bash
curl -s -X POST http://localhost:8787/webhooks/validate \
  -H 'content-type: application/json' \
  -H 'x-admin-api-key: dev-admin-key' \
  -d '{"url":"https://example.com/webhook","allowRedirects":false}' | jq
```

### Scan feature flags (defensive)

```bash
curl -s -X POST http://localhost:8787/feature-flags/scan \
  -H 'content-type: application/json' \
  -H 'x-admin-api-key: dev-admin-key' \
  -d '{"flags":[{"key":"apiKey","value":"sk_live_1234567890abcdef"}]}' | jq
```

## Security model (high level)
- **Admin API key middleware** with constant-time compare and hashed key storage.
- **Org isolation** enforced via orgId claims and org-scoped queries.
- **Zod validation** for every request body, params, and querystring.
- **No raw secrets stored**: findings store fingerprints (SHA-256), redacted previews, and evidence hashes only.
- **No raw token storage**: GitHub tokens are never persisted; integrations must use ephemeral credentials.
- **Structured logs** using `pino`, with request IDs and redaction of auth headers.
- **Rate limiting** via Redis-backed limiter.
- **Webhook SSRF defenses**: private IP blocking, metadata endpoint blocking, DNS rebinding defenses, redirect validation, and allowlists.
- **Evidence vault**: hashes + chain-of-custody timeline (content references only).

