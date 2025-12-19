# VERCEL_HISTORY

This directory stores uploaded Vercel ZIP drops and their manifest. Upload `.zip` files to `INBOX_UPLOADS/` (preferred) or the repo root; the GitHub Action will sort them here automatically.

## Structure
- `exports/` — transcripts, chats, exports, logs, manifests
- `3dt/` — Trinity, 3DT, and WebGPU-related drops
- `builds/` — build, bot, deploy, pipeline, hub, or Discord artifacts
- `misc/` — everything else
- `exports/_MANIFEST.json` — JSON array recording each stored ZIP (path, SHA-256, size, timestamp)

## How the sorter works
1. Push or upload `.zip` files to `INBOX_UPLOADS/` or the repo root.
2. A GitHub Action on `main` moves them into the correct subfolder (without overwriting existing files; it appends `-NN` if needed).
3. The action updates `_MANIFEST.json` with the stored file path, SHA-256, size, and timestamp, then opens a PR for review.
4. Merge the PR to accept the moves and manifest updates.
