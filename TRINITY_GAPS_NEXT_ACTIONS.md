# Trinity Gaps and Next Actions

Evidence gaps remain because Trinity/3DT artifacts are not present in this workspace.

## Missing Evidence
- Vercel chat/build transcripts (none found under `VERCEL_HISTORY/` after recursive scan).
- Any repository files containing Trinity/3DT indicators within CODEX.
- Defined checklist of required pieces for Trinity installation.

## Evidence Needed
- Exported transcript files placed under `VERCEL_HISTORY/exports/` (use dated folders or `undated/`) so CRAB legs can be indexed.
- File paths within accessible repos showing Trinity/3DT keywords (e.g., `3DT`, `TRINITY`, `WebGPU-3DT`, `EnvironmentRenderer`, 
`patchId="CLEAR"`).
- A populated `TRINITY_REQUIRED_PIECES.md` detailing the required components to verify installs.

## Next 3 Documentation-Only Actions
1. Upload Vercel transcript exports as text (`.md/.txt/.json`) into `VERCEL_HISTORY/exports/` and log them in `_MANIFEST.json`; t
hen regenerate the CRAB legs index.
2. Author the authoritative Trinity required pieces checklist in `TRINITY_REQUIRED_PIECES.md` so each repo/leg can be audited con
sistently.
3. Re-scan the CODEX repository for Trinity/3DT indicators once evidence exists and update `TRINITY_INSTALL_CATALOG.md` with conf
irmed statuses and checklist results.
