# Dual-Substrate Hosting Model

## Title
Add Dual-Substrate Hosting Model: VPS Execution Layer + Evernode Sovereign Trust Layer for WIRED CHAOS META

## Summary
This document formalizes a dual-substrate infrastructure model for WIRED CHAOS META:

- VPS-based infrastructure for continuous execution, gateways, and heavy workloads.
- Evernode-based infrastructure for trust anchoring, patch receipts, agent attestation, and canonical signaling.

Together, they define a system where execution remains scalable and flexible, while trust is verifiable and minimized.

## Motivation
WIRED CHAOS META requires both:

- Reliable, always-on execution environments.
- A system-wide mechanism for verifiable truth, provenance, and governance.

Traditional VPS environments excel at execution but rely on implicit trust. Evernode excels at trust and coordination but is not suited for heavy compute or UI. This model separates the concerns and integrates both as first-class layers.

## Scope of Changes

### 1) VPS Execution Layer (Newly Formalized)
Define VPS infrastructure as the Primary Execution Layer, responsible for:

- Long-running gateways (e.g., Clawdbot Gateway).
- Agent runtime environments.
- API endpoints and WebSocket services.
- Background workers and schedulers.
- Persistent workspace/state storage.

Supported environments include:

- Hetzner / AWS / Fly.io / Railway / exe.dev.
- Docker or VM-based deployments.

VPS nodes are treated as mutable, replaceable, and scalable.

### 2) Evernode Sovereign Layer (Anchoring & Verification)
Evernode is defined as the Sovereign Trust & Coordination Layer, responsible for:

- Agent identity attestation.
- Patch registration and receipts.
- Canonical signal timestamps.
- Anti-sybil and stake-backed verification.
- Cross-app coordination truth.

Evernode hosts Sentinel Agents only (no heavy compute).

### 3) VPS ↔ Evernode Bridge Protocol
Introduce a signed event bridge:

- VPS-based agents emit signed events.
- Events are observed and acknowledged by Evernode Sentinels.
- Evernode issues receipts (hash, time, identity, scope).
- VPS agents continue execution regardless, but trust state updates system-wide.

This preserves uptime while enabling verification.

### 4) Patch Lifecycle Enforcement
Patches follow a system-wide lifecycle:

- Declared on VPS.
- Registered on Evernode.
- Executed on VPS.
- Attested by Evernode.
- Revocable or sandboxed if trust is lost.

Unregistered patches remain functional but flagged as unverified.

### 5) Application Integration
Standalone apps (Akira Codex, NPC, FEN, Tax Suite, Trust Suite):

- Run on VPS or Vercel.
- Periodically check in with Evernode.
- Reference canonical state without direct coupling.
- Share truth without sharing infrastructure.

### 6) Swarm Room / CHAOS OS Semantics
CHAOS OS treats:

- VPS nodes as execution hardware.
- Evernode as constitutional hardware.

The Swarm Room UI reflects:

- Verified vs unverified agents.
- Trusted vs sandboxed patches.
- Canonical vs ephemeral signals.

Infrastructure remains invisible to end users.

## Out of Scope (Explicit)
- Moving UI or heavy compute to Evernode.
- Replacing VPS with decentralized hosting.
- Forcing Evernode registration for local dev.

## Architecture Impact
This model establishes a clean separation of concerns:

- Execution can scale, fail, or be replaced.
- Trust remains continuous and auditable.

The system becomes:

- More resilient.
- More governable.
- Institution-compatible.
- Adversary-aware.

## Backward Compatibility
No breaking changes. Existing VPS deployments continue unchanged. Evernode integration is additive and opt-in at first.

## Next Steps (Follow-Up PRs)
- VPS node classification (trusted / provisional / ephemeral).
- Sentinel Agent spec.
- Patch receipt schema finalization.
- Automated quarantine rules.
- NEXUS PUBLICA trust bridge.

## Review Focus
Reviewers should evaluate:

- VPS ↔ Evernode trust boundaries.
- Failure modes (VPS down, Evernode unreachable).
- Signature and receipt flow.
- Minimal coupling guarantees.
