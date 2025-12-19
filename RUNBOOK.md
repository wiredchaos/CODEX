# RUNBOOK (Agent Operating Guide)

This runbook instructs agents and maintainers on how to work with the CRAB and PATCHES without inventing details. Every step must cite files/paths and note testing decisions.

## Workflow
1. **Scan**  
   - Read `STATE.md`, `PATCHES.md`, and relevant repo READMEs.  
   - Note unknowns explicitly; do not guess.
2. **Propose**  
   - Open an issue or draft PR describing the patch, scope, and evidence.  
   - Identify affected repos and files; reference lines when possible.
3. **Implement**  
   - Work in a feature branch per repo.  
   - Add or update docs/tests as needed; avoid refactors unrelated to the patch.  
   - Keep changes scoped; one patch per PR unless explicitly approved.
4. **Validate**  
   - Run applicable tests or linters; if none exist, state "not run" with reason.  
   - Capture command output for traceability.
5. **Review**  
   - Ensure PR includes citations to modified files and any evidence.  
   - Confirm `STATE.md` or `PATCHES.md` updates when reality changes.  
   - Require at least one maintainer review for CRAB changes.
6. **Merge**  
   - Use squash or merge commits per repo policy; avoid direct pushes.  
   - Tag releases only when code changes warrant semantic bumps.
7. **Update STATE**  
   - After merge, update `STATE.md` to reflect new truth (repo status, docs, enforcement).  
   - Mark PATCHES as completed or reprioritized with date and rationale.

## Decision Boundaries
- If information is missing due to private repos or GitHub errors, record the gap in `STATE.md` and proceed with available data.
- Architectural changes must be justified by in-repo evidence; aspirational goals belong in issues until backed by code/docs.

## Communication
- Summaries should be concise, neutral, and cite sources.  
- Use the PR description template from `KERNEL.md` rules: what changed, why, tests, and references.
- For cross-repo work, link related PRs and ensure each repo’s `STATE` entry notes the change.
