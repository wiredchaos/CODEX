# WIRED CHAOS CRAB / PATCH / 3DT CONNECTION MAP

Status: PROPOSED CANONICAL STRUCTURE  
Authority: NEURO review required  
Scope: documentation and registry architecture only; no patch internals changed

## 1. Purpose

This document connects the currently fragmented WIRED CHAOS repositories into one evidence-based operating structure.

The governing model is:

```text
AGENTROPOLIS INTELLIGENCE GRID
  -> WIRED CHAOS CONTROL PLANE
    -> CRAB GOVERNANCE
      -> PATCH REGISTRY (CRAB LEGS)
        -> 3DT SHARED RUNTIME / WORLD REGISTRY
          -> PATCH APPLICATIONS, ROOMS, DISTRICTS, AND MEDIA SURFACES
```

This is a connection map, not a claim that every listed repository is production-ready.
Unknowns remain UNKNOWN until inspected and recorded in `STATE.md`.

## 2. Terms and ownership boundaries

### CRAB

The CRAB is the canonical truth and governance body for WIRED CHAOS.
It owns organizational reality, evidence, status, runbooks, acceptance rules, and the patch queue.

Evidence:
- `KERNEL.md`
- `STATE.md`
- `RUNBOOK.md`
- `PATCHES.md`
- `CRAB_LEGS_INDEX.md`

### PATCH / CRAB LEG

A PATCH is a scoped capability that attaches to the CRAB.
A CRAB leg is the indexed relationship between a patch, its repository, its runtime contract, and its evidence.

A patch may be an app, tool, district surface, studio, infrastructure adapter, prototype, or content system.
A patch does not become canonical merely because a repository exists.

### 3DT

3DT means 3D Trinity.
It is a shared WIRED CHAOS platform contract, registry, and spatial presentation layer.
Consumers provide content, metadata, routes, and approved interaction logic.
Consumers do not replace the shared runtime, registry, permissions, or environment.

Evidence:
- `3DT_CONSUMER_CONTRACT.md`
- `3DT_ROOM_CONSUMER.md`
- `GOVERNANCE/CONSUMER_3DT_CONTRACT.md`

### WIRED CHAOS

WIRED CHAOS is the human-facing operating environment and control plane that presents Agentropolis capabilities, CRAB-governed patches, rooms, missions, studios, vaults, media systems, and agent workflows.

### AGENTROPOLIS

AGENTROPOLIS is the Intelligence Grid beneath WIRED CHAOS: runtime, memory, registry, dispatch, policy/risk, audit, and ingest infrastructure.
WIRED CHAOS consumes those services rather than duplicating them.

## 3. Current repository map

### A. CRAB authority

| Repository | Proposed role | Current evidence | Status |
| --- | --- | --- | --- |
| `wiredchaos/CODEX` | CRAB governance authority | Kernel, state, runbook, patch queue, 3DT contracts, ingest workflows | KEEP AS CANONICAL CRAB |

### B. Primary WIRED CHAOS shells and surfaces

| Repository | Proposed role | Current evidence | Status |
| --- | --- | --- | --- |
| `wiredchaos/wcmnav` | Navigator / Motherboard World / elevator shell | `MotherboardWorld.jsx`, `CrabGuide.jsx`, towers, floors, missions, galaxy navigation | KEEP; CONVERT TO REGISTERED CONTROL-PLANE CONSUMER |
| `wiredchaos/wcmmain` | Main public or application shell candidate | Repository name and WIRED CHAOS references observed | AUDIT REQUIRED |
| `wiredchaos/wcmla` | Legacy gated landing / entry experience | `SYSTEM.md` defines landing, assessment, `TrinityMount`, and redirect flow | KEEP AS LEGACY ENTRY PATCH OR RETIRE AFTER AUDIT |
| `wiredchaos/dyadWCM` | Declarative floor and mode registry prototype | `src/config/patches.ts` defines lobby, operations, registry, arcade, core, multiverse, and modes | KEEP AS REGISTRY INPUT; DO NOT TREAT AS AUTHORITY |
| `wiredchaos/v0-use-wcmhub-v-1-0` | Studio / museum patch prototype | `lib/patch-registry.ts` defines a read-only Trinity consumer manifest and routes | KEEP AS PATCH; NORMALIZE MANIFEST |
| `wiredchaos/v0-WCMSTR` | WCM prototype | Listed in `STATE.md` as a TypeScript PATCH | AUDIT REQUIRED |
| `wiredchaos/FigmawcproductionDesign` | WIRED CHAOS design system and screen prototype | CHAOS OS, glyphs, motherboard, system core, vaults, 789 Studios | KEEP AS DESIGN-SYSTEM SOURCE; CORRECT CANON BEFORE RUNTIME USE |
| `wiredchaos/nmx-wiredchaos` | NEURO / NMX-facing UI prototype | Vite/React/Lovable repository; generic README | AUDIT REQUIRED |
| `wiredchaos/WCM-HERMES-BLUEPRINT` | Hermes integration blueprint | Repository identified; implementation depth unknown | AUDIT REQUIRED |
| `wiredchaos/wcmdao-launchpad` | DAO / launchpad patch candidate | WCM-named repository | AUDIT REQUIRED |
| `wiredchaos/wiredchaos-AGENTROPOLIS-NETERU` | Agentropolis / WIRED CHAOS / NETERU bridge | Explicit bridge repository name | AUDIT REQUIRED |

### C. Identity conflict / drift

| Repository | Conflict | Required action |
| --- | --- | --- |
| `wiredchaos/wired-chaos` | Contains WIRED CHAOS 3DT consumer documentation, but the current README identifies the repository as `XENTS-CAPITAL-GRID` | QUARANTINE IDENTITY; decide whether to restore WIRED CHAOS scope or move 3DT documents to the true runtime owner |

The repository must not be called the WIRED CHAOS core until this identity conflict is resolved.

### D. 3DT core and runtime candidates

| Repository | Observed capability | Proposed role |
| --- | --- | --- |
| `wiredchaos/v0-interactive-3-d-infographic` | World registry, patch registry, timeline ledger, health swarm, schemas | STRONGEST CURRENT 3DT CORE CANDIDATE; extract or promote after audit |
| `wiredchaos/CODEX` | 3DT consumer contracts, room contract, pipeline scripts, governance | CONTRACT AND GOVERNANCE OWNER; not rendering owner |
| `wiredchaos/wired-chaos` | Consumer integration guide, UX mandate, types | CONSUMER REFERENCE ONLY until identity drift is resolved |
| `wiredchaos/wcmnav` | R3F world, elevators, towers, crab guide, missions | NAVIGATOR CONSUMER; should not own the shared runtime |
| `wiredchaos/NTKY2090-2090-AGENT-ARENA` | 3DT paths, execution UI, floor registry, route surface | EXPERIMENTAL 3DT CONSUMER / PATH ENGINE CANDIDATE |
| `wiredchaos/ntru` | `ElevatorSystem3DT.tsx` and WIRED CHAOS badge | NTRU 3DT CONSUMER |
| `wiredchaos/neura-portal3dt` | Named 3DT portal experiment | EXPERIMENTAL CONSUMER |
| `wiredchaos/neuralis` | 3DT world badge and world registry panels | WORLD-REGISTRY UI CONSUMER |
| `wiredchaos/citiz3nh3x` | Trinity system and patch registry | EXPERIMENTAL REGISTRY / GAME CONSUMER |

## 4. Canonical technical separation

```text
CODEX / CRAB
  owns: truth, governance, status, contracts, acceptance, evidence

AGENTROPOLIS
  owns: agent runtime, memory, dispatch, skills, policy, audit, ingest

WIRED CHAOS CONTROL PLANE
  owns: human command surfaces, Mission Control, Swarm Room, navigation, approvals

3DT CORE
  owns: world registry, room mounts, spatial runtime, hotspots, fallback behavior

PATCH REPOSITORIES
  own: domain content, application logic, assets, routes, patch-specific tests
```

No patch may silently define its own replacement governance, runtime, registry, permissions, or 3DT engine.

## 5. One canonical patch manifest

Every CRAB leg should eventually resolve to one registry record with these fields:

```yaml
patch_id: string
repo: owner/name
display_name: string
owner: string
classification: infrastructure | district | studio | application | experiment
status: proposed | active | paused | deprecated | archived | quarantined
realm: business | akashic | dual | web3
agentropolis_services:
  - runtime
  - memory
  - dispatch
  - skills
  - policy-risk
  - audit
3dt:
  role: none | consumer | core-candidate
  room_type: lobby | system | lore | runtime | vault | studio | district
  trinity_level: integer
  route_slug: string
  ambient_only: true
  fallback: gradient | video | static
entrypoints:
  - path
routes:
  - path
access_rules:
  soft: []
  hard: []
dependencies: []
evidence:
  - repo/path
validation:
  tests: not-run | passed | failed
  notes: string
```

This schema replaces competing ad hoc manifests after migration.

## 6. Proposed CRAB registry structure

```text
CODEX/
  KERNEL.md
  STATE.md
  RUNBOOK.md
  PATCHES.md
  WIRED_CHAOS_CRAB_3DT_STRUCTURE.md
  registry/
    repositories.yaml
    patches.yaml
    3dt-worlds.yaml
    routes.yaml
    ownership.yaml
  contracts/
    patch.schema.json
    3dt-consumer.schema.json
    agentropolis-service-binding.schema.json
  audits/
    repo-visibility/
    patch-adoption/
    3dt-compliance/
    identity-drift/
```

The registry is descriptive and auditable.
Runtime applications consume generated artifacts from it; they do not edit CRAB authority directly.

## 7. Connection sequence

### Phase 1: Establish truth

1. Complete repository visibility audit.
2. Add each identified repository to `registry/repositories.yaml`.
3. Mark identity conflicts, duplicates, unknowns, and archive candidates.
4. Replace the empty transcript-only CRAB legs model with repo-backed legs while preserving transcript evidence as one evidence source.

### Phase 2: Select the 3DT owner

1. Audit `v0-interactive-3-d-infographic` as the strongest existing core candidate.
2. Decide whether to promote it or extract its registries into a dedicated `WIRED-CHAOS-3DT-CORE` repository.
3. Keep 3DT governance contracts in CODEX.
4. Convert all other 3DT implementations into declared consumers or experiments.

### Phase 3: Normalize WIRED CHAOS surfaces

1. Use `wcmnav` as the spatial navigator candidate.
2. Use the Figma project as design-system input, not canonical architecture.
3. Select one main shell from `wcmmain`, `v0-WCMSTR`, or another audited candidate.
4. Register `wcmla` as legacy entry, redirect-only gateway, or retirement candidate.
5. Quarantine `wired-chaos` until the XENTS identity conflict is resolved.

### Phase 4: Bind Agentropolis infrastructure

Each active patch declares which Agentropolis services it consumes:

```text
Identity -> Mandate -> Plan -> Execute -> Receipt -> Audit -> Human Review
```

WIRED CHAOS presents the controls and receipts.
Agentropolis performs governed execution.
CRAB records what is canonical.
3DT presents rooms and spatial continuity without replacing product usability.

## 8. 3DT UX rules

3DT remains invisible infrastructure on initial load:

- product UI stays usable without 3DT
- ambient layers never block interaction
- no exposed engine or canvas terminology
- fallback behavior is mandatory
- shared runtime and registry remain read-only to consumers
- accessibility and LITE-mode surfaces take precedence over spectacle

## 9. Immediate patch queue

1. **Repository truth registry** — create `registry/repositories.yaml` from verified GitHub evidence.
2. **Patch schema** — create `contracts/patch.schema.json` and normalize the existing manifests.
3. **3DT owner audit** — compare `v0-interactive-3-d-infographic`, `wcmnav`, `citiz3nh3x`, and NTKY path tooling.
4. **Identity drift audit** — resolve `wiredchaos/wired-chaos` versus `XENTS-CAPITAL-GRID` content.
5. **Control-plane selection** — identify the main WIRED CHAOS shell and classify all other shells as patches, legacy, experiments, or archives.
6. **Agentropolis binding contract** — specify required runtime, memory, dispatch, policy, receipt, and audit interfaces.

## 10. Definition of done for this structure patch

- [x] CRAB, PATCH, CRAB leg, and 3DT boundaries documented.
- [x] Known WIRED CHAOS and 3DT repositories grouped by proposed role.
- [x] Identity drift recorded without guessing.
- [x] Initial canonical manifest shape proposed.
- [x] Build phases documented.
- [ ] Repository inventory verified with language, visibility, last update, CI, and owner.
- [ ] Runtime owner selected.
- [ ] Registry files created and validated.
- [ ] Consumer repositories migrated.

## Validation

Documentation-only patch. No build or runtime tests were run.
Repository and file claims were derived from inspected GitHub paths and must be revalidated during the formal visibility audit.
