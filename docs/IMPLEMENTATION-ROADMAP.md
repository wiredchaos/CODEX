# AGENTROPOLIS AI Sovereignty Control Plane: IMPLEMENTATION-ROADMAP

This document covers the first functional TypeScript implementation of the provider-neutral control plane. The implementation is intentionally mock-first: provider adapters do not call real model APIs, benchmark values are marked unknown/not_verified in registries, and model output is treated as untrusted infrastructure data.

## Implemented surface
- Model Gateway routes every request through policy, rights, circuit-breaker, cost, latency, health, capability, and jurisdiction checks.
- Provider adapters include mock cloud, mock local, and deterministic fallback providers.
- Registries live under registry/ for models, providers, hardware, rights, and jurisdictions.
- Audit and telemetry use append-only JSON Lines in data/ for local development.
- Evaluation and stress harnesses exercise AGENTROPOLIS sovereignty scenarios without claiming real model quality.

## Production gaps
- Replace mock adapters with OpenAI-compatible, Anthropic-compatible, Gemini-compatible, Ollama, vLLM, llama.cpp, or edge adapters after security review.
- Move JSONL persistence to a PostgreSQL-compatible repository interface for multi-node production.
- Add external policy service integration, administrative approvals, and signed registry provenance.
