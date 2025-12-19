# Production Checklist (ZIP Ingest)

Use this checklist to move uploads from drop-off to merge without needing developer tooling.

## Upload
- [ ] ZIP files are placed in `INBOX_UPLOADS/` only.
- [ ] Commit pushed to `main` (or branch) contains no ZIPs outside `INBOX_UPLOADS/`.
- [ ] No sensitive data is inside the ZIPs.

## Automation
- [ ] "Ingest Vercel ZIP exports" workflow has run and completed.
- [ ] A pull request was opened automatically with extraction and documentation updates.
- [ ] Safety check workflow shows no warnings about misplaced ZIPs (or warnings were addressed).

## Verification
- [ ] Extracted contents appear under `VERCEL_HISTORY/unpacked/<zipname>/` in the PR.
- [ ] `VERCEL_HISTORY/exports/_MANIFEST.json` includes the new archive entry.
- [ ] Audit docs updated in the PR (`CRAB_LEGS_INDEX.md`, `TRINITY_INSTALL_CATALOG.md`, `TRINITY_GAPS_NEXT_ACTIONS.md`).

## Merge
- [ ] PR description notes automation-only changes.
- [ ] A reviewer confirms docs reflect the upload and no ZIPs live outside `INBOX_UPLOADS/`.
- [ ] PR is merged after verification; automation branch is cleaned up by the bot.
