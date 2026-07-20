# STATE (CRAB Snapshot)

This snapshot captures the observable state of WIRED CHAOS repositories based on inspected GitHub files and repository search results. Unknowns remain explicit. The repository inventory is still incomplete until language, update time, CI, ownership, and deployment evidence are captured systematically.

## CRAB Authority

- **CODEX** — Documentation and governance repository. Holds `KERNEL.md`, `STATE.md`, `RUNBOOK.md`, `PATCHES.md`, CRAB leg indexing, 3DT consumer contracts, and evidence-ingest workflows. Status: **Active CRAB authority**.

## Confirmed WIRED CHAOS / WCM Repositories

- **wired-chaos** — Contains 3DT consumer documentation and types, but its current README identifies the repository as `XENTS-CAPITAL-GRID`. Status: **PATCH / identity conflict / quarantine pending decision**.
- **wcmnav** — React Three Fiber navigator with Motherboard World, towers, floors, elevator, missions, galaxy navigation, and a CRAB guide. Status: **PATCH / navigator candidate**.
- **wcmmain** — WCM-named application repository. Status: **PATCH candidate / audit required**.
- **wcmla** — Gated landing experience with assessment flow and `TrinityMount`; redirects to an external Signs Stack. Status: **Legacy entry PATCH / audit required**.
- **dyadWCM** — Declarative patch manifest prototype with floors, modes, and status flags. Status: **PATCH / registry input**.
- **v0-WCMSTR** — TypeScript WCM prototype. Status: **PATCH / audit required**.
- **v0-use-wcmhub-v-1-0** — TypeScript hub prototype containing a read-only Trinity consumer manifest for Virtual Signal Studio and Neon Vault Museum routes. Status: **PATCH / normalize manifest**.
- **wcmdao-launchpad** — WCM DAO/launchpad repository. Status: **PATCH candidate / audit required**.
- **WCM-HERMES-BLUEPRINT** — Public Hermes blueprint repository. Status: **Conceptual PATCH / audit required**.
- **WCM-NueroMX** — WCM / NEURO repository. Status: **PATCH candidate / audit required**.
- **nmx-wiredchaos** — Vite/React prototype with generic Lovable README. Status: **PATCH / audit required**.
- **wiredchaos-AGENTROPOLIS-NETERU** — Named bridge between WIRED CHAOS, Agentropolis, and NETERU. Status: **Bridge PATCH / audit required**.
- **FigmawcproductionDesign** — CHAOS OS / WIRED CHAOS META design system and multi-screen prototype. Status: **PATCH / design source; canon correction required before runtime adoption**.
- **Figmawcchaos** — TypeScript documentation/design-focused repository. Status: **PATCH / design assets**.

## Confirmed 3DT Evidence

- **CODEX** — Owns 3DT consumer contracts and governance documents. Status: **3DT contract owner; not rendering owner**.
- **v0-interactive-3-d-infographic** — Contains world registry, patch registry, timeline ledger, health swarm, schemas, and 3DT UI. Status: **strongest observed 3DT core candidate; audit required**.
- **wired-chaos** — Contains `lib/docs/3dt-ux-rules.md`, `lib/docs/trinity-integration.md`, and read-only consumer types. Status: **3DT consumer reference with repository identity conflict**.
- **wcmnav** — Contains a full R3F world shell and navigation system. Status: **3DT navigator consumer candidate**.
- **NTKY2090-2090-AGENT-ARENA** — Contains `/3dt` route, path engine, path definitions, path execution UI, floor registry, and PATCH profiles. Status: **experimental 3DT consumer/path-engine candidate**.
- **ntru** — Contains `ElevatorSystem3DT.tsx`. Status: **3DT consumer**.
- **neuralis** — Contains 3DT world badge and world registry panels. Status: **3DT registry UI consumer**.
- **citiz3nh3x** — Contains Trinity system and patch registry. Status: **experimental 3DT/game consumer**.
- **neura-portal3dt** — Named 3DT portal experiment. Status: **experimental consumer**.

## Existing PATCH Candidates from Prior Snapshot

- **v0-789** — TypeScript prototype. Status: PATCH.
- **v0-CLEAR** — TypeScript infrastructure/tooling. Status: PATCH.
- **NPC-12** — TypeScript infrastructure/tooling. Status: PATCH.
- **WC-MPCR** — TypeScript prototype. Status: PATCH.
- **VRG-ECHO-ENGINEERS** — TypeScript prototype. Status: PATCH.
- **v0-wc-dicbot** — TypeScript active application. Status: PATCH.
- **fastapi** — Python active application. Status: PATCH.
- **NPC** — Documentation with limited signals. Status: PATCH candidate.
- **codex-neteru** — Documentation/conceptual repository. Status: PATCH candidate.

## Archive Candidates from Prior Snapshot

- **TAX-SUITE-** — No primary language observed; appears inactive. Status: Archive candidate.
- **FEN** — No primary language observed in prior snapshot; appears inactive there. Status: Archive candidate pending re-audit.

## Structural Decision Under Review

The proposed connection map is documented in `WIRED_CHAOS_CRAB_3DT_STRUCTURE.md`:

```text
AGENTROPOLIS INTELLIGENCE GRID
  -> WIRED CHAOS CONTROL PLANE
    -> CRAB GOVERNANCE
      -> PATCH REGISTRY / CRAB LEGS
        -> 3DT SHARED RUNTIME
          -> PATCH SURFACES
```

This is a proposed canonical structure until reviewed and merged by NEURO/maintainers.

## Activity Signals and Reality Gaps

- Repository naming and responsibility are fragmented across WCM, WIRED CHAOS, Lovable, Figma, Dyad, v0, and experiment repositories.
- Multiple patch registries exist with incompatible schemas and authority assumptions.
- The `CRAB_LEGS_INDEX.md` transcript index is empty and does not currently represent repo-backed patch legs.
- A rendering/runtime owner for 3DT has not been accepted.
- The `wired-chaos` repository has an identity conflict between its name/3DT documents and its current XENTS README.
- CI/CD, deployment targets, maintainers, last-update timestamps, and release cadence remain unknown for most repositories.
- No repository should be designated production core solely from its name or prototype completeness claim.
