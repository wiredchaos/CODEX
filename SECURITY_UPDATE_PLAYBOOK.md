# Security Update Playbook

This repository runs npm as the canonical package manager. Dependabot and CI are configured to keep dependencies current while avoiding risky changes.

## How to handle Dependabot PRs
- Review labels: `dependencies` PRs without `needs-human` are eligible for auto-merge once CI is green.
- `needs-human` indicates a major or risky bump. Review release notes, run the migration steps below, and update the PR with a short migration note before merging.
- If a lockfile conflict appears, regenerate with `npm ci` followed by `npm run build` to confirm the project still compiles.

## Canonical lockfile policy
- Use `package-lock.json` only. Remove `yarn.lock` if it appears or update workflows to handle dual lockfiles before merging.
- Before committing dependency changes, run `npm ci` to validate the lockfile and `npm audit --production --audit-level=high` to confirm high/critical issues are addressed.

## Dependency update steps
1. `npm ci`
2. `npx prisma generate` (required for TypeScript builds)
3. `npm run build`
4. `npm test --if-present` (tests are optional but should be added if new surface area appears)
5. `npm audit --production --audit-level=high`

## Handling majors and tricky advisories
- For majors: read release notes, add migration notes to the PR description, and apply the `needs-human` label if it is missing.
- For transitive vulnerabilities with no upstream patch, use `overrides` in `package.json` to pin a safe version and explain the rationale in the PR summary.
- If no fix exists (e.g., unpatched advisory), document the risk, affected paths, and a proposed mitigation or alternative package before merging.

## Weekly security sweep
- The `Weekly security sweep` workflow runs every Monday to audit dependencies, enforce the npm lockfile, and scan the filesystem. Keep it passing to ensure auto-merge remains trustworthy.
