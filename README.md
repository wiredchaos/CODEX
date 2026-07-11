# AGENTROPOLIS Sovereignty Control Plane

Provider-neutral infrastructure for the AGENTROPOLIS Intelligence Grid. Applications must not call model providers directly; all AI operations pass through the Model Gateway.

## Why provider abstraction
The control plane prevents dependency on one model, API provider, hardware vendor, jurisdiction, or runtime. It supports cloud providers, local models, edge inference, deterministic fallback, rights tracking, capability tracking, cost controls, circuit breakers, telemetry, audit logging, and no-model emergency operation.

## Run locally
```bash
pnpm install
pnpm sovereignty:server
```

Gateway endpoint:
```bash
curl -X POST http://localhost:8787/v1/gateway/execute \
  -H 'content-type: application/json' \
  -d '{"operation":"generate","input":"status","dataClassification":"restricted"}'
```

## Test and validate
```bash
pnpm sovereignty:typecheck
pnpm sovereignty:test
pnpm sovereignty:validate-registries
```

## Add a provider adapter
Implement `ModelProviderAdapter` in `src/sovereignty/providers.ts` or a new adapter file, add a provider record under `registry/providers/`, add at least one model under `registry/models/`, and add rights metadata under `registry/rights/`.

## Add a model record
Create or update JSON under `registry/models/` with operations, capabilities, deployment modes, jurisdictions, status, and clearly marked unknown/not_verified fields where facts are unresolved.

## Trigger a stress test
```bash
curl -X POST http://localhost:8787/v1/stress-tests/run \
  -H 'content-type: application/json' \
  -d '{"scenario":"force-no-model-mode"}'
```

## Mocked in v1
All provider outputs, quality scores, performance fields, and licenses are mock or unverified unless explicitly stated otherwise. No real API keys are required.
