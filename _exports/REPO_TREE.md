# Repo Tree Snapshot (depth 6)

## Root
- `/` — Workspace root holding CRAB governance docs plus numerous uploaded ZIP archives (mostly "3-DT" / Trinity-related packages awaiting ingest).
- `/_exports/` — Generated reporting outputs (this run).
- `/scripts/` — Python utilities for sorting/ingesting Vercel ZIP exports and regenerating audit docs.
- `/VERCEL_HISTORY/` — Placeholder for processed ZIPs/manifests (`exports/` exists; other buckets created by automation).
- `/.github/` — GitHub Actions workflows orchestrating ZIP sorting, ingest, and safety checks.

## ZIP archives (root-level files)
- `*3-dt*.zip`, `*3DT*.zip`, `akira-codex-*.zip`, `wired-chaos-hub-3-dt.zip`, `monorepo-layout-and-firewall.zip`, etc. — Uploaded source bundles; include 3DT/Trinity, Akira Codex, Discord bot builds, tax component, and other PATCH/prototype payloads.

## scripts/
- `scripts/vercel_zip_ingest.py` — Unpacks ZIPs from `INBOX_UPLOADS/`, scans for transcripts/Trinity keywords, updates manifests, and rewrites CRAB audit docs.
- `scripts/vercel_zip_sorter.py` — Routes ZIPs into `VERCEL_HISTORY/{exports,3dt,builds,misc}` and updates a manifest with hashes/metadata.

## VERCEL_HISTORY/
- `VERCEL_HISTORY/exports/` — Houses ingest manifests and run summaries; empty of transcripts in current workspace snapshot.

## .github/
- `.github/workflows/vercel_zip_sorter.yml` — Auto-move uploaded ZIPs into `VERCEL_HISTORY` buckets; opens PRs with manifest updates.
- `.github/workflows/vercel_zip_ingest.yml` — Runs ingest script on ZIP uploads; updates docs/manifests and opens PRs.
- `.github/workflows/vercel_zip_safety.yml` — PR guard ensuring ZIPs stay inside `INBOX_UPLOADS/`.

## Documentation files (root)
- Governance/state: `KERNEL.md`, `STATE.md`, `PATCHES.md`, `RUNBOOK.md`.
- Org/reporting: `README.md`, `ORG_SYNCHRONIZATION_REPORT.md`, `CRAB_LEGS_INDEX.md`, `TRINITY_*` audit files, `COPILOT_PROMPT.md`.
- Operational: `UPLOAD_CONTRACT.md`, `PRODUCTION_CHECKLIST.md`.
- Programs/briefs: `FASHION_DESIGN_SWARM.md`.
