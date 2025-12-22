# Copilot instructions for CODEX

Purpose: keep dependency/security maintenance predictable and low-risk.

## Expectations
- Favor the smallest safe bump (patch/minor) before considering majors.
- This repo uses **npm + package-lock.json** as the canonical lockfile. Do not add `yarn.lock` unless explicitly requested.
- Keep dependency updates grouped by ecosystem (npm) and avoid unrelated changes.
- When advisories require transitive fixes, prefer `overrides` in `package.json` and document why.
- Run `npm ci`, `npx prisma generate`, and `npm run build`; include test or audit commands when available.

## PR notes
- Summarize what changed, why (link the advisory if known), and the risk level.
- If a major/breaking update is unavoidable, add migration notes and mark the PR with `needs-human`.
