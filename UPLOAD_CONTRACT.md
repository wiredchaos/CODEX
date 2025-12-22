# Upload Contract (Non-Developer Safe)

This repository is wired so that uploads are simple and automation does the rest. Follow this contract to keep things safe and predictable.

## Where to upload
- Place **all** `.zip` files in the `INBOX_UPLOADS/` folder.
- Do not upload or move ZIPs anywhere else.

## What happens automatically
- Pushing a commit with ZIPs in `INBOX_UPLOADS/` triggers the ingest automations.
- The automations unpack the ZIPs into `VERCEL_HISTORY/unpacked/<zipname>/`, update manifests and audit docs, and open a pull request with the results.
- A safety check runs on every PR to flag ZIPs that are **not** in `INBOX_UPLOADS/`.

## What **not** to touch
- Do not rename or move existing folders (e.g., `VERCEL_HISTORY/`, `INBOX_UPLOADS/`).
- Do not edit workflow files unless you are maintaining the automation.
- Do not upload secrets or sensitive data inside the ZIPs.

## How to verify success
- After uploading, open the **Actions** tab and confirm the latest ingest run completed.
- Open the pull request created by the automation and confirm:
  - Extracted contents appear under `VERCEL_HISTORY/unpacked/<zipname>/`.
  - `VERCEL_HISTORY/exports/_MANIFEST.json` shows the new ZIP entry.
  - Audit docs (`CRAB_LEGS_INDEX.md`, `TRINITY_INSTALL_CATALOG.md`, `TRINITY_GAPS_NEXT_ACTIONS.md`) were updated.
- If the safety check comments about misplaced ZIPs, move them into `INBOX_UPLOADS/` and push a fix.
