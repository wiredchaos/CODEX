# PATCHES (Queue)

Prioritized patches attach to the CRAB. Each entry lists purpose, owner, and definition of done (DoD). Owners may delegate but remain accountable for updates in `STATE.md` upon completion.

## Priority 1

1. **Repository visibility audit**  
   - **Owner:** NEURO (delegate: maintainer)  
   - **Purpose:** Confirm full list of WIRED CHAOS repos (public and private), capture primary language, last update, CI presence, ownership, deployment target, and classification.  
   - **DoD:** `STATE.md` and `registry/repositories.yaml` updated with a verified repo table; missing access and identity conflicts documented.

2. **CRAB adoption checklist**  
   - **Owner:** Maintainers  
   - **Purpose:** Enforce kernel rules across repos (branch protection, PR templates referencing citations/testing, README pointers to CRAB).  
   - **DoD:** Checklists per repo with status; PR templates added where missing; protections documented; `RUNBOOK.md` updated with enforcement steps.

3. **Patch board hygiene**  
   - **Owner:** NEURO  
   - **Purpose:** Align existing prototypes with PATCH status and retirement decisions.  
   - **DoD:** `PATCHES.md` and `registry/patches.yaml` include accept, pause, quarantine, deprecate, or archive decisions with rationale and next review date.

4. **CRAB / PATCH / 3DT connection map**  
   - **Owner:** NEURO (delegate: architecture maintainer)  
   - **Purpose:** Establish one boundary model connecting Agentropolis infrastructure, WIRED CHAOS control surfaces, CRAB governance, PATCH legs, and the shared 3DT layer.  
   - **Evidence:** `WIRED_CHAOS_CRAB_3DT_STRUCTURE.md`.  
   - **DoD:** Connection map reviewed; CRAB terms accepted; competing registries identified; first canonical schemas and registry files approved.

5. **3DT runtime-owner audit**  
   - **Owner:** Architecture maintainer  
   - **Purpose:** Determine which repository, if any, should own the shared 3DT runtime and registries. Compare `v0-interactive-3-d-infographic`, `wcmnav`, `citiz3nh3x`, NTKY path tooling, and existing CODEX contracts.  
   - **DoD:** Evidence table completed; one owner selected or a dedicated `WIRED-CHAOS-3DT-CORE` extraction approved; all other implementations classified as consumer, experiment, legacy, or archive.

6. **WIRED CHAOS shell consolidation**  
   - **Owner:** NEURO  
   - **Purpose:** Select one main WIRED CHAOS control-plane shell and classify `wcmmain`, `wcmnav`, `wcmla`, `dyadWCM`, `v0-WCMSTR`, `nmx-wiredchaos`, and Figma prototypes.  
   - **DoD:** One primary shell designated; navigator, design system, entry gate, and legacy surfaces assigned explicit roles; duplicate shells receive migration or retirement plans.

7. **Identity drift resolution: `wired-chaos`**  
   - **Owner:** NEURO  
   - **Purpose:** Resolve the mismatch between the repository name/3DT documents and its current `XENTS-CAPITAL-GRID` README.  
   - **DoD:** Repository restored to a clearly defined WIRED CHAOS scope, renamed/reclassified, or its WIRED CHAOS documents migrated to the correct owner; `STATE.md` updated.

## Priority 2

1. **Canonical repository registry**  
   - Create `registry/repositories.yaml` with evidence paths, status, visibility, ownership, runtime, deployment, CI, and classification.

2. **Canonical patch registry**  
   - Create `registry/patches.yaml` and migrate competing manifests from `dyadWCM`, `v0-use-wcmhub-v-1-0`, `v0-interactive-3-d-infographic`, `citiz3nh3x`, and other audited patches.

3. **Patch contract schema**  
   - Create `contracts/patch.schema.json` covering repo identity, Agentropolis service bindings, realm/mode, access rules, routes, dependencies, evidence, validation, and lifecycle status.

4. **3DT consumer schema**  
   - Create `contracts/3dt-consumer.schema.json` from `3DT_CONSUMER_CONTRACT.md`, `3DT_ROOM_CONSUMER.md`, and the 3DT UX mandate.

5. **Agentropolis service-binding contract**  
   - Define how WIRED CHAOS patches consume identity, mandate, runtime, memory, dispatch, skills, policy/risk, receipts, audit, and ingest services.

6. **CRAB legs index migration**  
   - Expand `CRAB_LEGS_INDEX.md` beyond missing Vercel transcripts so each leg can be backed by repository evidence, transcripts, manifests, tests, and deployment records.

## Backlog

- **Runtime mapping** — Identify deployment/hosting assumptions for active apps; add evidence-based notes to `STATE.md`.
- **CI coverage sweep** — Document current CI tools per repo; propose minimum checks for PATCH repos with code.
- **Ownership matrix** — Assign accountable maintainers per repo and add to `STATE.md` and `registry/ownership.yaml`.
- **Route collision audit** — Identify duplicated room, floor, district, studio, and application routes across patches.
- **Canon correction sweep** — Correct entertainment routing, LITE/FULL boundaries, district names, and outdated Wix/Lovable/Figma assumptions before promoting prototypes.
- **Accessibility and graceful-degradation audit** — Verify 3DT consumer surfaces remain fully usable when spatial rendering is disabled or unavailable.
