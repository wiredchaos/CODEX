# PR Title

Add PersonaPlex full-duplex Presence Layer integration for real-time conversational agents

# Summary

This PR proposes integrating NVIDIA PersonaPlex-7B-v1 as a first-class Presence Layer component within the WIRED CHAOS architecture.

PersonaPlex enables real-time, full-duplex speech-to-speech interaction (simultaneous listening and speaking), replacing traditional ASR → LLM → TTS chains with a single low-latency conversational loop. The goal is to support natural interruptions, overlap, backchannels, and continuous persona expression in agentic systems.

This PR does not add reasoning logic to PersonaPlex. It strictly scopes the model as an embodiment / interaction engine, controlled by higher-level agents.

# Motivation

Current voice integrations are turn-based and introduce latency, unnatural pauses, and brittle conversational flow. PersonaPlex’s architecture aligns with agentic systems that operate continuously rather than discretely.

This integration enables:

- Natural conversational cadence (interruptions, overlap, silence)
- Persistent persona and voice state across sessions
- Separation of intent & policy from expression & timing
- Compatibility with event-driven and swarm-based agent systems

# Architectural Placement

PersonaPlex is introduced as a Presence Layer, sitting below execution logic and above raw I/O:

```
Brain        → intent, policy, arbitration
Crab         → task decomposition & strategy
Legs         → execution (APIs, renders, calls)
Presence     → continuous interaction & embodiment
-----------------------------------------------
PersonaPlex  → full-duplex speech engine
```

Key constraint:

- PersonaPlex does not decide goals or strategy
- It only expresses state and semantic content provided upstream

# Key Changes

## New Components

- PresenceController interface
  - Manages persona state, control signals, and semantic packets
- PersonaPlexAdapter
  - Wraps PersonaPlex session lifecycle
  - Handles streaming audio I/O
  - Accepts structured semantic input instead of raw text

## Data Flow

- Brain emits semantic packets (intent, confidence, urgency, tone)
- PresenceController maps packets → PersonaPlex prompts
- PersonaPlex handles:
  - timing
  - turn-taking
  - overlap
  - vocal expression

## Explicit Non-Goals

- No policy logic inside PersonaPlex
- No hard coupling to UI or rendering layers
- No assumption of canvas or visual output

# Example Semantic Packet

```json
{
  "intent": "explain",
  "content": "Vault 33 activation sequence",
  "urgency": 0.6,
  "confidence": 0.8,
  "openness": 0.4
}
```

PersonaPlex determines how this is spoken, not why.

# Compatibility & Extensibility

- PersonaPlex is abstracted behind PresenceController
- Future voice or embodiment models can be swapped without affecting:
  - Brain logic
  - Task decomposition
  - Execution pipelines
- Designed to interoperate with:
  - WebSocket / gRPC streaming
  - WebGPU-based conversational field computation
  - Rendering systems (e.g., Remotion, game engines)

# License & Model Notes

- Model: PersonaPlex-7B-v1
- License: NVIDIA Open Model License
- This PR does not redistribute weights; it defines integration hooks and interfaces only.

# Review Focus

Feedback requested on:

1. Presence Layer abstraction boundaries
2. Persona state management strategy
3. Separation of semantic intent vs. expressive control
4. Streaming lifecycle handling

# Follow-ups (Post-Merge)

- WebGPU-assisted conversational pacing
- Multi-persona session arbitration
- Live NPC / broadcast host orchestration
