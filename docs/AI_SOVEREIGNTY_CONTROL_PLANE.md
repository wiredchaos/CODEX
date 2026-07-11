# AI Sovereignty Control Plane

## Canonical authority
- Canonical authority: `wiredchaos/AGENTROPOLIS-SOVEREIGNTY`
- Current implementation location: `wiredchaos/CODEX/src/sovereignty`
- Status: experimental reference implementation
- Migration target: package, extract, or mirror into the canonical sovereignty repository after validation

CODEX does not redefine AGENTROPOLIS sovereignty doctrine. CODEX does not become the canonical policy authority. Registry formats should be portable, application code must not depend on CODEX-specific paths, and this subsystem must remain extractable into a standalone package or repository.

## Local use
- `pnpm sovereignty:typecheck`
- `pnpm sovereignty:test`
- `pnpm sovereignty:validate-registries`

Registries live under `registry/sovereignty`. Schemas live under `schemas/sovereignty`. Mock records are explicitly `mock`, `not_verified`, or `development_only`; unknown cost, latency, licensing, reliability, performance, hardware throughput, and jurisdiction approval must remain `unknown` or `not_verified` until verified.

## Policy posture
Rights and restricted-data routing fail closed. Missing or malformed rights, unknown license status, expired reviews, prohibited jurisdictions, unsupported commercial use, and missing references make a route ineligible rather than merely lowering score. `dataClassification: restricted` rejects non-approved cloud providers, cannot be downgraded by fallback or stress-test mode, and emits local development audit records on denial.
