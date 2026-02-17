# ARCHITECTURE PLANES — WIRED CHAOS META

## Objective
Define canonical separation of concerns for WIRED CHAOS META so policy, identity, ingress, and execution can evolve independently without authority drift.

## Plane Catalog

## 1) Root Law Plane
**Artifact**: `ROOT_LAW.md`

**Responsibilities**
- Defines immutable constraints and system invariants.
- Sets compliance conditions for all subordinate planes.

**Must not**
- Contain runtime implementation details.

## 2) Immune Layer Plane
**Artifact**: `IMMUNE_LAYER_SPEC.md`

**Responsibilities**
- Establishes trust scoring, verification outcomes, quarantine rules, and threat posture handling.
- Converts raw claims/signals into policy outcomes consumed by downstream services.

**Must not**
- Execute business workflows directly.

## 3) DFC Core Service Plane
**Artifact**: `DFC_CORE_SERVICE_SPEC.md`

**Responsibilities**
- Hosts deterministic flow control, state transitions, and decision orchestration.
- Applies immune outputs and governance constraints to route requests.

**Must not**
- Hardcode chain/provider logic.

## 4) Brand Orientation Layer Plane
**Artifact**: `BRAND_ORIENTATION_LAYER_SPEC.md`

**Responsibilities**
- Encodes experience posture, presentation constraints, and domain orientation policies.
- Aligns product-facing behavior with canonical identity and governance terms.

**Must not**
- Override trust, policy, or routing decisions from core planes.

## 5) Ingress Membrane Plane
**Artifact**: `INGRESS_MEMBRANE_SPEC.md`

**Responsibilities**
- Validates and normalizes inbound payloads.
- Enforces schema, auth context shaping, and boundary-level rejection paths.

**Must not**
- Execute downstream side effects prior to successful policy gating.

## 6) Execution Fabric Plane
**Artifact**: `EXECUTION_FABRIC_SPEC.md`

**Responsibilities**
- Runs approved side effects via adapters/services.
- Emits execution receipts and telemetry for replay and audit.

**Must not**
- Self-authorize beyond DFC-issued execution directives.

## Cross-Plane Invariants
- **Single-source policy authority**: policy outcomes originate from declared planes, not ad hoc runtime branches.
- **Auditability**: each plane emits machine-verifiable artifacts for critical decisions.
- **Substitutability**: execution adapters can be swapped without rewriting immune or governance semantics.
- **Minimal coupling**: each plane consumes contracts, not implementation internals.

## Change Management
Any change that alters a plane's responsibilities requires:
1. Spec update in the corresponding plane artifact.
2. Explicit statement of impacted upstream/downstream contracts.
3. Confirmation that root law constraints remain satisfied.
