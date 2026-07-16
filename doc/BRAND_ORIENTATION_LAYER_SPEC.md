# BRAND ORIENTATION LAYER SPEC — WIRED CHAOS META

## Mission
Define how WIRED CHAOS META experience and messaging align with canonical governance and trust posture without mutating core policy authority.

## Responsibilities
- Maintain a consistent orientation vocabulary for system states (trusted, challenged, quarantined, denied, executed).
- Bind UX-facing labels and guidance to underlying policy decisions.
- Prevent brand drift by enforcing canonical narrative constraints across surfaces.

## Inputs
- Policy outcomes from immune + DFC planes.
- Governance-approved orientation lexicon.
- Runtime telemetry summaries relevant to participant communication.

## Outputs
- Standardized state descriptors for UI and operator tooling.
- Guidance templates for user-facing decision explanations.
- Orientation metadata for docs and operational runbooks.

## Constraints
- Cannot reinterpret a denial as approval.
- Cannot hide quarantine/challenge posture from observability surfaces.
- Cannot inject new authorization rules.

## Canonical State Mapping
- `ALLOW + EXECUTE` -> "Authorized Path"
- `CHALLENGE` -> "Additional Proof Required"
- `QUARANTINE` -> "Isolated Pending Review"
- `DENY/REJECT` -> "Policy Blocked"

## Governance Hooks
Orientation changes require:
1. Approved update to orientation lexicon.
2. Compatibility check with Root Law and immune semantics.
3. Documentation update in this artifact and any impacted user-facing docs.

## Non-Goals
- Rendering implementation.
- Business KPI optimization logic.
- Adapter-level transaction handling.
