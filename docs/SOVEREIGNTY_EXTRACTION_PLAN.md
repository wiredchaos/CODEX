# Sovereignty Extraction Plan

Canonical destination: `wiredchaos/AGENTROPOLIS-SOVEREIGNTY`.

## Package boundaries
Extract `src/sovereignty`, `registry/sovereignty`, `schemas/sovereignty`, and sovereignty-specific tests into a standalone package with no CODEX path assumptions.

## Dependencies
Keep dependencies minimal: TypeScript, Express service adapter, and Node filesystem primitives for local development audit output. Production persistence adapters remain placeholders until implemented in the canonical repository.

## Registry migration
Move registry JSON by type: models, providers, hardware, rights, and jurisdictions. Preserve portable IDs and validate references before and after migration.

## Test migration
Move routing, rights, restricted-data, circuit-breaker, admin-security, audit, stress-test, and registry-integrity tests. CI must fail on broken references, expired review dates, duplicate IDs, unknown fields, or malformed URLs.

## CI migration
Replicate blocking jobs for typecheck, tests, registry validation, build/test, and gitleaks without `|| true`.

## Data migration
Local JSONL files are development-only audit output and should not be treated as source-of-truth production data. Production migration requires PostgreSQL, object storage, signed receipts, WORM/immutable storage, or external audit systems.

## API compatibility
Maintain stable route request/response shapes, explicit denial reasons, and registry IDs. Any breaking changes require migration notes in the canonical sovereignty repository.
