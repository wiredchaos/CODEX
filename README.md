# CODEX

WIRED CHAOS WORKFLOW PUBLISH CODEX

## Structure
- `README.md`: Brief label for the repository and quick pointers.
- `DIAGNOSTIC.md`: Current snapshot of repository layout, status, and recommended next steps.
- `docs/PAGEINDEX_AGENTIC_INGESTION.md`: Proposal for integrating PageIndex as a core ingestion substrate for agentic systems.

## Copilot prompt
See [COPILOT_PROMPT.md](COPILOT_PROMPT.md) for the recommended Copilot Chat prompt to synchronize on the WIRED CHAOS organization.

## Org synchronization report
For the latest synthesized view of the WIRED CHAOS GitHub organization, review the [ORG_SYNCHRONIZATION_REPORT.md](ORG_SYNCHRONIZATION_REPORT.md).

## Fashion Design Swarm
The [FASHION_DESIGN_SWARM.md](FASHION_DESIGN_SWARM.md) brief captures the FDS-1 onboarding blueprint for bringing Web2 fashion designers into the dripONchain™ lab.

## CRAB Kernel and Patch Board
Start here for governance and coordination:
- [KERNEL.md](KERNEL.md) — authority model and operating rules.
- [STATE.md](STATE.md) — current snapshot of repositories and classifications.
- [PATCHES.md](PATCHES.md) — prioritized patch queue with owners and definitions of done.
- [RUNBOOK.md](RUNBOOK.md) — step-by-step workflow for agents and maintainers.

## Agents
Prototype agents and reference implementations:
- [vision_struct_agent.py](vision_struct_agent.py) — FastAPI wrapper and Swarm interface for Vision-to-JSON multimodal extraction.
## WIRED CHAOS Intake Protocol UI

The Next.js intake panel provides a 3DT job creator and live status console. Run it locally:

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Open http://localhost:3000 and submit intake payloads. The UI will create a job, poll its status, and surface artifacts when complete.
## Trinity / 3DT audit (status only)
- [CRAB_LEGS_INDEX.md](CRAB_LEGS_INDEX.md) — Vercel transcript index; currently waiting on exports.
- [TRINITY_INSTALL_CATALOG.md](TRINITY_INSTALL_CATALOG.md) — repo and transcript status by evidence.
- [TRINITY_REQUIRED_PIECES.md](TRINITY_REQUIRED_PIECES.md) — checklist placeholder for required components.
- [TRINITY_GAPS_NEXT_ACTIONS.md](TRINITY_GAPS_NEXT_ACTIONS.md) — missing evidence and next documentation steps.

## Portfolio Multiverse (non-developer view)
- Open `portfolio_multiverse/index.html` locally or on a static host to enter the galaxy lobby immediately (no builds required).
- Stars represent every `-3DT` patch from the registry; click a star to drop into its 3D room or open the Trinity Elevator to ride timelines.
- Locks are enforced visually: soft-locked rooms glow amber, hard-locked rooms are hidden ghosts until your `user_state.json` meets the rules.
- Rendering is STUB_RUNTIME-only; future engines can mount into the shared room container without changing patch content.

## Portfolio Multiverse CODEX prompt
Use [`PORTFOLIO_MULTIVERSE_CODEX_PROMPT.md`](PORTFOLIO_MULTIVERSE_CODEX_PROMPT.md) as the paste-ready CODEX instruction set to build the WOW-first immersive lobby, Trinity Elevator, and registry-driven rooms with Akashic skipping in the WIRED CHAOS MAIN repository.
## 3DT Consumer Model
All projects ending in `-3DT` are consumers of the Wired Chaos platform. They rely on the platform runtime, registry, permissions, and environment; they do not replace or fork those systems. See:
- [TRINITY_CONSUMERS.md](TRINITY_CONSUMERS.md) for the formal definition and boundaries.
- [3DT_CONSUMER_CONTRACT.md](3DT_CONSUMER_CONTRACT.md) for the plain-language contract every `-3DT` project inherits.


## How uploads work
Uploads are drop-only: place `.zip` files in `INBOX_UPLOADS/` via **Add file → Upload files**, commit, then let automation unpack, update docs, and open a PR. Check the latest **Ingest Vercel ZIP exports** run in the **Actions** tab and review the PR for extracted files and refreshed audit docs.

- [UPLOAD_CONTRACT.md](UPLOAD_CONTRACT.md) — plain-language rules and what happens automatically.
- [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) — step-by-step checks for upload, automation, verification, and merge.

## 3DT Multiverse Overview
CODEX operates as the truth layer holding manifests, contracts, and state. WIRED CHAOS is the execution layer enforcing runtime, security, and lifecycle. 3DT is the experiential layer that renders traversal for participants once conditions are satisfied. Users traverse patches non-linearly, hopping across hubs and timelines after clearing required gates, reflecting a multiverse of routes instead of a single linear application.

## Development setup
- Install dependencies with `pnpm`.
- If your network blocks the default registry, pin npm to the public registry before installing: `npm config set registry https://registry.npmjs.org/`.
- The repo includes a checked-in `.npmrc` with the same registry pin to keep installs consistent across environments.
- If you need to consume scoped packages hosted on GitHub Packages, authenticate with your scope before installing: `npm login --scope=@yourScope --registry=https://npm.pkg.github.com`.
