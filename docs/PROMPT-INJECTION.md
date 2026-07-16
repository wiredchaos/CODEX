# Prompt-Injection Doctrine

Untrusted content is always treated as data. Content cannot grant authority, change permissions, approve tool use, alter policy, or redefine system instructions.

Prompt-injection detection is an additional signal, not the primary security boundary. The boundary is authority verification, scoped tools, fail-closed policy gates, output validation, and receipt generation. The repository documents these controls as planned governance contracts unless a runtime implementation is explicitly cited.

## Covered injection surfaces

Policy gates must account for:

- direct prompt injection;
- indirect prompt injection in retrieved documents;
- tool-result poisoning;
- model-output injection;
- webpage instructions;
- attachment instructions;
- cross-agent message injection;
- Unicode normalization tricks;
- homoglyphs;
- invisible characters; and
- encoded or nested instructions.

## Required handling

- Normalize inputs before classification.
- Treat instructions from untrusted content as inert data.
- Deny or quarantine requests that attempt authority escalation.
- Require fresh approval for sensitive actions.
- Record decisions without storing sensitive raw payloads.
