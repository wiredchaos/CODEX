# Agentic UI Ingestion + Transmission Frame Compiler (WIRED CHAOS META)

## Purpose
This document defines the first external code ingestion pipeline for WIRED CHAOS META. The pipeline ingests MIT-licensed agentic UI components, normalizes them into a canonical inventory, and compiles them into Transmission Frames aligned with WIRED CHAOS META governance and auditability requirements.

## Pipeline Overview
1. **Source ingestion (agenticui/agentic-ui)**
   - Clone and index the MIT-licensed `agenticui/agentic-ui` repository.
   - Scan `src/` for exported React components.
   - Extract component names, export locations, and UI capability surfaces (verbs, events, props).
   - Output: `wiredchaos_out/agentic-ui.inventory.json`.

2. **Component extraction tooling**
   - Node-based extractor walks the file graph.
   - Detects named exports and re-exports.
   - Produces a normalized component inventory for downstream compilation.

3. **Transmission Frame spec (canonical)**
   - Defines UI modules mapped from ingested components.
   - Captures agent I/O contracts.
   - Encodes guardrails (human approval, denied actions).
   - Includes telemetry, traceability, and visual interaction constraints.

4. **Reference implementation**
   - Maps `ChatInput` from agentic-ui into a frame with:
     - Tool selection
     - Business function routing
     - Event capture
     - Transmission logging

## Why This Matters
- Separates UI surface from agent governance.
- Enables safe reuse of open-source agentic components.
- Establishes a standard contract between UI, agents, and humans.
- Keeps WIRED CHAOS META extensible without vendor lock-in.

## License & Compliance
- `agenticui/agentic-ui` is MIT-licensed.
- Attribution is preserved.
- No proprietary assets or non-code resources are ingested.

## Follow-ups
- Frame Pack v1 (Signal Intake, Ops Monitor, Audit Viewer, Approval Gate)
- AG-UI protocol adapter (streaming + shared state)
- Swarm Room layout binding
- Patch Registry UI + contract enforcement

## Changelog
- 2026-01-22: Initial pipeline overview, spec, and follow-ups captured.
