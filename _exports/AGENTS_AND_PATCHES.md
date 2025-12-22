# Agents and Patch Registry

## Governance Agents
- **NEURO (authority)** — Final decision-maker for CRAB changes and PATCH acceptance.【F:KERNEL.md†L1-L20】 Inputs: PRs with evidence; Outputs: approvals/merge decisions.
- **Maintainers** — May delegate reviews and merge PATCHES if criteria met; enforce citation/testing rules.【F:KERNEL.md†L8-L29】【F:RUNBOOK.md†L1-L33】
- **Contributors/Agents** — Propose changes via PRs; must follow RUNBOOK steps and cite evidence.【F:KERNEL.md†L8-L33】【F:RUNBOOK.md†L1-L33】

## Patch Board (CRAB-aligned)
- **PATCHES.md** queue lists prioritized work: repository visibility audit, CRAB adoption checklist, patch board hygiene; backlog includes runtime mapping, CI sweep, ownership matrix.【F:PATCHES.md†L1-L23】 Inputs: repo evidence; Outputs: updated STATE/PATCHES tables.
- **Patch Naming** — Patch identifiers appear as repo names (e.g., `v0-CLEAR`, `NPC-12`, `v0-789`) and are tracked as PATCH candidates in `STATE.md`. No code naming convention beyond repo name prefixes observed.【F:STATE.md†L1-L33】

## Automation Agents (Workflows)
- **vercel_zip_sorter** (`.github/workflows/vercel_zip_sorter.yml`) — Moves ZIPs from root/INBOX_UPLOADS into `VERCEL_HISTORY` buckets (`exports`, `3dt`, `builds`, `misc`), updates manifest; auto-PR with manifest changes.【F:.github/workflows/vercel_zip_sorter.yml†L1-L35】 Inputs: ZIP files; Outputs: moved archives, `_MANIFEST.json` entries.
- **vercel_zip_ingest** (`.github/workflows/vercel_zip_ingest.yml`) — Unpacks ZIPs from `INBOX_UPLOADS`, scans transcripts for Trinity keywords, updates audit docs and run summary, opens PR.【F:.github/workflows/vercel_zip_ingest.yml†L1-L48】【F:scripts/vercel_zip_ingest.py†L1-L120】 Inputs: ZIP archives; Outputs: `CRAB_LEGS_INDEX.md`, `TRINITY_INSTALL_CATALOG.md`, `TRINITY_GAPS_NEXT_ACTIONS.md`, manifest JSON.
- **vercel_zip_safety** (`.github/workflows/vercel_zip_safety.yml`) — PR guard commenting if ZIPs exist outside `INBOX_UPLOADS/`.【F:.github/workflows/vercel_zip_safety.yml†L1-L44】 Inputs: PR file list; Outputs: warning comments.

## Swarm Roles (Program Briefs)
- **FASHION DESIGN SWARM Agents** — Roles include FDS-ARCHON (curriculum control), CUTMASTER (pattern logic), TEXTILE-AI (materials), DRAPE-ENGINE (3D drape physics), AVATAR-FORGE (rigging), CHAIN-LOOM (NFT traits/DOGE inscriptions), MERCH-VAULT (commerce), RUNWAY-SIM (runway/OTT), FASHION-BOT (mentor/alerts). All report to NEURO BRAIN.【F:FASHION_DESIGN_SWARM.md†L6-L35】 Inputs: designer performance data, trait unlock events; Outputs: training progression, NFT mint triggers, commerce alerts.

## Registries and Routers
- **CRAB_LEGS_INDEX.md** — Intended transcript registry; currently empty pending uploads.【F:CRAB_LEGS_INDEX.md†L1-L18】 Inputs: Vercel transcripts; Outputs: indexed legs with Trinity indicators.
- **TRINITY_INSTALL_CATALOG.md** — Status router summarizing Trinity evidence by repo and transcript; currently marked missing.【F:TRINITY_INSTALL_CATALOG.md†L1-L31】 Inputs: transcript scans; Outputs: repo/leg status tables.
- **scripts/vercel_zip_sorter.py** — Internal classifier routing ZIPs into buckets based on filename heuristics, ensuring non-overwrite paths and manifest updates.【F:scripts/vercel_zip_sorter.py†L1-L80】 Inputs: ZIP files; Outputs: relocated files + manifest entries.

## Isolation / Firewall Rules
- No explicit sandboxing rules beyond PR-based governance; safety workflow enforces ZIP location to prevent arbitrary file placement.【F:.github/workflows/vercel_zip_safety.yml†L1-L44】 Agents must avoid CRAB document edits without evidence per RUNBOOK/KERNEL.
