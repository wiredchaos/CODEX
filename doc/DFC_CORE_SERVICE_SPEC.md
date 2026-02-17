# DFC CORE SERVICE SPEC — WIRED CHAOS META

## Mission
Define deterministic flow control (DFC) that translates validated requests + policy envelopes into authorized execution directives.

## Responsibilities
- Resolve workflow intent and state transitions.
- Enforce policy precedence: Root Law -> Governance -> Immune decision -> Flow logic.
- Generate explicit execution directives for the execution fabric.
- Emit auditable receipts for every transition.

## Inputs
- Normalized request context from ingress membrane.
- Immune decision envelope.
- Governance manifests/contracts and routing rules.
- Runtime capability metadata (available adapters/endpoints).

## Outputs
- `EXECUTE` directive (authorized side-effect request).
- `DEFER` directive (requires prerequisites or async staging).
- `REJECT` directive (policy-compliant refusal with reason).

## Decision Model
1. Validate that input context is complete and policy-addressable.
2. Abort/Reject if immune output is non-allowing.
3. Resolve flow state and required capabilities.
4. Produce directive with immutable decision metadata.
5. Publish receipt + telemetry for audit chain continuity.

## Required Receipt Fields
- Correlation ID.
- Plane source (`DFC_CORE`).
- Input hashes/references.
- Governing rule IDs.
- Final directive and rationale.

## Safety Guarantees
- No side effects emitted without explicit `EXECUTE` directive.
- Unknown state transitions resolve to `REJECT`.
- Directives are idempotency-addressable by correlation + intent keys.

## Integration Boundaries
- Must consume adapters through stable interfaces only.
- Must not embed provider-specific protocol details.
- Must not bypass immune/gov constraints for performance shortcuts.
