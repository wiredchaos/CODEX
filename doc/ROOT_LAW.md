# ROOT LAW — WIRED CHAOS META

## Purpose
`ROOT_LAW` is the non-negotiable contract for WIRED CHAOS META. Every architectural or implementation decision must trace back to this law.

## Non-Negotiable Constraints
1. **Spec before runtime**: architecture and governance specs are authoritative; runtime code is an implementation of approved specs.
2. **No plane collapse**: identity, policy, ingress, and execution responsibilities must remain separated across canonical planes.
3. **Deterministic policy enforcement**: all trust decisions must be auditable, replayable, and explainable from explicit inputs.
4. **Adapter boundaries only**: chain/provider specifics must stay behind adapter interfaces and never leak into shared policy semantics.
5. **Fail-safe defaults**: unknown states, unsupported claims, or unverifiable payloads must resolve to deny/quarantine behavior.
6. **Evidence-carrying operations**: critical flows must emit artifacts (receipts, logs, proofs, or traces) that can be reviewed post hoc.
7. **No hidden authority**: governance and routing decisions must be derived from explicit manifests, contracts, or documented rules.

## Architectural Scope
The root law governs the canonical architecture set:
- `ARCHITECTURE_PLANES.md`
- `IMMUNE_LAYER_SPEC.md`
- `DFC_CORE_SERVICE_SPEC.md`
- `BRAND_ORIENTATION_LAYER_SPEC.md`
- `INGRESS_MEMBRANE_SPEC.md`
- `EXECUTION_FABRIC_SPEC.md`

## Compliance Requirements
A change is compliant only when all are true:
- It preserves clear plane ownership and boundaries.
- It preserves deny-by-default behavior at trust boundaries.
- It preserves evidence generation for decisions and side effects.
- It avoids introducing runtime behavior that bypasses documented policy planes.

## Review Gate
PRs that alter architecture or runtime behavior should include:
- A mapping from changed files to architecture planes.
- A statement describing how the change preserves root law constraints.
- Updated spec artifacts if plane semantics changed.
