# Build / Deployment Surface

## Tooling & Automation
- **GitHub Actions**: three workflows handle ZIP sorting, ingest, and safety checks (Python 3.11 runners).【F:.github/workflows/vercel_zip_sorter.yml†L1-L35】【F:.github/workflows/vercel_zip_ingest.yml†L1-L48】【F:.github/workflows/vercel_zip_safety.yml†L1-L44】
- **Python Scripts**: `scripts/vercel_zip_sorter.py` classifies/moves ZIPs and writes `_MANIFEST.json`; `scripts/vercel_zip_ingest.py` unpacks archives, scans for Trinity keywords, updates CRAB docs, and emits run summaries.【F:scripts/vercel_zip_sorter.py†L1-L80】【F:scripts/vercel_zip_ingest.py†L1-L193】
- **Vercel**: No direct config files present; workflows reference Vercel transcripts only via naming conventions.

## Runtime/Monorepo Notes
- Repository is documentation-heavy with uploaded ZIP bundles (3DT/Trinity, Akira Codex, Discord bots, tax components) awaiting automation; no compiled app targets present in working tree.
- `VERCEL_HISTORY/` acts as storage for processed artifacts (`exports/` present; `3dt`, `builds`, `misc` created on demand).【F:CRAB_LEGS_INDEX.md†L1-L18】【F:.github/workflows/vercel_zip_sorter.yml†L1-L35】

## Environment Variables / Secrets
- Workflows rely on default `GITHUB_TOKEN`; no additional secrets/env vars declared in YAML.

## Fresh Workspace Checklist
1. Install Python 3.11+ and `pip` (for running ingest/sorter scripts manually or via Actions).【F:.github/workflows/vercel_zip_ingest.yml†L17-L24】
2. Ensure `INBOX_UPLOADS/` exists for incoming ZIPs; run sorter to relocate archives into `VERCEL_HISTORY/*` buckets if necessary.【F:.github/workflows/vercel_zip_sorter.yml†L1-L35】【F:scripts/vercel_zip_sorter.py†L1-L80】
3. Run `python scripts/vercel_zip_ingest.py` to unpack and refresh audit docs after uploads; check `_MANIFEST.json` and `_INGEST_RUN_SUMMARY.json` under `VERCEL_HISTORY/exports/`.【F:scripts/vercel_zip_ingest.py†L1-L193】
4. Review regenerated `CRAB_LEGS_INDEX.md`, `TRINITY_INSTALL_CATALOG.md`, and `TRINITY_GAPS_NEXT_ACTIONS.md` for evidence updates before committing.【F:.github/workflows/vercel_zip_ingest.yml†L25-L48】
5. Commit changes and let Actions open PRs (or push manually following RUNBOOK); ensure ZIPs remain in `INBOX_UPLOADS/` to satisfy safety checks.【F:.github/workflows/vercel_zip_safety.yml†L1-L44】【F:RUNBOOK.md†L1-L33】

## Workspace Adaptation Notes
- All evidence comes from docs and automation scaffolding; actual app builds or Vercel projects are not present. Adapting to a fresh environment primarily requires Python tooling and GitHub Actions compatibility.
