# CRAB Kernel

This kernel anchors governance for WIRED CHAOS. It defines how the "CRAB" (the canonical truth) and its "PATCHES" (modular capabilities) are managed so agents stay aligned, auditable, and non-speculative.

## Authority Model
- **NEURO** is final authority for direction and acceptance of changes to the CRAB.
- **Maintainers** may delegate reviews and merge PATCHES that meet acceptance criteria.
- **Agents and contributors** propose changes via PRs; no direct pushes to default branches.

## CRAB vs PATCH
- **CRAB**: Documentation and configuration that define reality for the organization (governance, state, runbooks, patch queue). Lives in this repo and is the source of truth.
- **PATCH**: A scoped capability (app, tool, infra, prototype) that attaches to the CRAB. PATCH work lives in dedicated repositories and is tracked in `PATCHES.md` with clear owners and definitions of done.

## Naming and Versioning
- CRAB files use clear, descriptive names (e.g., `KERNEL.md`, `STATE.md`, `RUNBOOK.md`, `PATCHES.md`).
- PATCH repos should use concise, purpose-forward names; avoid ambiguous prefixes without context.
- Documented changes use semantic bump notes (major/minor/patch) in changelog sections when applicable.

## Merge Acceptance Rules
- Every PR must: 
  - Cite specific files/paths for assertions and decisions ("no hallucination" rule).
  - Include a test or validation note, even if "not run" with rationale.
  - Update `STATE.md` when the change alters organizational reality.
  - Update `PATCHES.md` when adding/completing/reprioritizing PATCH work.
- Default branch protection: requires review and passing checks where configured.

## Provenance and Evidence
- Claims about repositories, architecture, or status must reference observed files or command output. Unknowns stay marked as unknown.
- External information (e.g., GitHub UI glitches) is noted as context, not fact, unless verifiable in-repo.

## Scope Boundaries
- CRAB governs coordination and truth; it does not redesign patch internals.
- PATCHES must not alter CRAB documents except through PRs that also update `STATE.md` and `RUNBOOK.md` if workflows change.

## Change Logging
- Each merged PR should summarize CRAB-impacting changes at the top of the modified file or in a short appended changelog section.
- Deprecated PATCHES are archived in `PATCHES.md` with rationale and date.
