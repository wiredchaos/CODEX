# PATCHES (Queue)

Prioritized patches attach to the CRAB. Each entry lists purpose, owner, and definition of done (DoD). Owners may delegate but remain accountable for updates in `STATE.md` upon completion.

## Priority 1
1. **Repository visibility audit**  
   - **Owner:** NEURO (delegate: maintainer)  
   - **Purpose:** Confirm full list of WIRED CHAOS repos (public and private), capture primary language, last update, CI presence, and classification.  
   - **DoD:** `STATE.md` updated with verified repo table including timestamps and CI/issue signals; any missing access documented.

2. **CRAB adoption checklist**  
   - **Owner:** Maintainers  
   - **Purpose:** Enforce kernel rules across repos (branch protection, PR templates referencing citations/testing, README pointers to CRAB).  
   - **DoD:** Checklists per repo with status; PR templates added where missing; protections documented; `RUNBOOK.md` updated with enforcement steps.

3. **Patch board hygiene**  
   - **Owner:** NEURO  
   - **Purpose:** Align existing prototypes with PATCH status and retirement decisions.  
   - **DoD:** `PATCHES.md` updated to include accept/retire decisions for listed prototypes; archive candidates tagged with rationale and next review date.

## Backlog
- **Runtime mapping** — Identify deployment/hosting assumptions for active apps; add evidence-based notes to `STATE.md`.
- **CI coverage sweep** — Document current CI tools per repo; propose minimum checks for PATCH repos with code.
- **Ownership matrix** — Assign accountable maintainers per repo and add to `STATE.md`.
