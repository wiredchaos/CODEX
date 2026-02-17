# IMMUNE LAYER SPEC — WIRED CHAOS META

## Mission
Provide deterministic, explainable trust and threat handling so inbound claims are converted into enforceable security posture.

## Inputs
- Authentication attestations (nonce/signature/ownership proofs).
- Credential verification artifacts.
- Payload metadata (origin, timestamp, schema class, rate profile).
- Governance deny/allow intelligence from canonical manifests.

## Outputs
- `ALLOW`: request may proceed to DFC orchestration.
- `CHALLENGE`: request requires additional proof or friction.
- `QUARANTINE`: request is isolated for review and cannot execute side effects.
- `DENY`: request is rejected with explicit policy reason.

Each output must include:
- Decision code.
- Rule identifiers used.
- Evidence references.
- TTL / revalidation expectations.

## Core Behaviors
1. **Verification fusion**: consolidate independent trust signals into a deterministic posture.
2. **Threat posture mapping**: classify risk according to configurable policy bands.
3. **Quarantine-first uncertainty handling**: unresolved ambiguity defaults to non-executable paths.
4. **Replay protection support**: enforce nonce/timestamp freshness constraints.

## Policy Rules
- Unknown verifier state => `QUARANTINE`.
- Invalid signature/proof => `DENY`.
- Rate or anomaly threshold breach => `CHALLENGE` or `QUARANTINE` depending on severity.
- Verified low-risk actor with valid payload => `ALLOW`.

## Required Artifacts
- Decision receipt (machine-readable JSON in runtime implementation).
- Correlation ID for trace linkage.
- Security telemetry event suitable for timeline/review pipelines.

## Interfaces
- **Upstream**: ingress membrane submits normalized claims.
- **Downstream**: DFC consumes immune decision envelope and acts under deny-by-default semantics.

## Non-Goals
- UI rendering concerns.
- Business domain pricing/listing logic.
- Provider-specific execution code.
