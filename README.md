# KDAOcore

KDAOcore is the private KennelDAO backend foundation: API, database, authentication abstraction, permissions, governance services, treasury records, audit receipts, notifications, queues, and integration layer.

## Boundaries
- `kenneldao.org`: public website/frontend.
- `wiredchaos/KDAOcore`: off-chain system of record and API.
- `wiredchaos/kdaocmd`: private operator/admin command center.
- `wiredchaos/barkbuildownkdao`: smart contracts and on-chain logic.
- Agentropolis: shared agent infrastructure, policy, memory, dispatch, skills, and receipts.

KDAOcore does not store private keys, seed phrases, production credentials, or automatic on-chain execution logic.

## Local setup
```bash
npm install
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

## Environment
Copy `.env.example` to `.env` locally. Required values: `DATABASE_URL`, `PORT`, `CORS_ORIGINS`, `AUTH_JWT_ISSUER`, `AUTH_JWT_AUDIENCE`, `CONTRACT_ENVIRONMENT`.

## Commands
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run prisma:validate`
- `npm run build`

## Security warnings
Use sealed runtime secrets. Never commit `.env`, private keys, seed phrases, wallet signing material, or production tokens. Contract writes are prepared only and require an authorized external signer.
