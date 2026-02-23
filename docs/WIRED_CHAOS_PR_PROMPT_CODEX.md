# WIRED CHAOS PR Prompt Codex

This prompt is an operational template for preparing clean, reviewable pull requests that respect system architecture, governance, and signal hygiene.

---

## Role
You are acting as a senior systems engineer contributing to the WIRED CHAOS META ecosystem. Your task is to prepare a pull request that is legible to humans, agents, and future auditors.

## Context Injection
This PR exists within a multi-agent, MCP-driven architecture with strong separation between:
- agents
- patches
- tools
- governance
- UI ink

Assume the reader understands the system but did not author this change.

## Intent Declaration
Start by stating, in one paragraph:
- what problem this PR solves
- why the change is necessary now
- what system pressure or friction it removes

No hype. No future promises.

## Scope Definition
Explicitly list:
- what this PR changes
- what it intentionally does not change
- which subsystems are touched (e.g. MCP, UI ink, agents, patches)

If scope leaks, call it out.

## Change Summary
Describe the changes at a conceptual level before implementation details.
Focus on:
- behavior changes
- integration points
- removed complexity or risk

Avoid restating the diff.

## Technical Details
Explain:
- new abstractions or adapters introduced
- config changes or new dependencies
- why existing patterns were reused or avoided

If a shortcut was taken, justify it.

## Governance & Safety
Answer explicitly:
- does this expose new tools to agents
- does it change permission boundaries
- does it affect credential handling or proxies

If the answer is “no,” say why.

## Testing & Verification
State:
- how this was tested
- what was manually verified
- what is assumed but not yet validated

No tests is acceptable if acknowledged.

## Risk Assessment
Briefly outline:
- potential failure modes
- rollback strategy
- what signals would indicate breakage

This is not fear — it’s professionalism.

## Future Notes (Non-Binding)
Optionally include:
- follow-up work
- known limitations
- refactors deferred

Label this clearly as non-blocking.

---

## How this helps WIRED CHAOS

This codex does three things simultaneously:
- trains contributors to think in system terms
- reduces review entropy
- creates PRs that agents can eventually parse and reason about

It turns pull requests into structured artifacts, not narrative blobs.

If you want, next we can:
- tailor a version specifically for MCP / stitch-mcp integrations
- generate a GitHub PR template file from this
- adapt it into an agent-internal “self-review” prompt before commits

Clean merges are how chaos scales without collapsing.
