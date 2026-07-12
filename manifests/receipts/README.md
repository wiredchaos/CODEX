# Deployment receipts

A deployment is not governed until its receipt validates.

Deployment receipts are the evidence layer for AGENTROPOLIS-DEPLOY. They record what was packaged, which governed target it maps to, which source repository and runtime produced it, how validation completed, and how the deployment can be rolled back. They do not deploy code, mutate Cloudflare routes, or store credentials.

## Lifecycle

1. Create or update an import plan in `manifests/import-plans/*.import-plan.json` before recording deployment evidence.
2. Run the deployment process outside this repository's validation scripts.
3. Record the resulting evidence as `manifests/receipts/<deploymentId>.receipt.json`.
4. Run `pnpm validate:receipts`.
5. Keep the receipt with the release record so rollback and audit reviews can verify the deployment boundary.

## Filename convention

Receipt filenames must exactly match the receipt deployment ID:

```text
<deploymentId>.receipt.json
```

The template file is intentionally named `deployment-receipt.template.json`, so it is not validated as real deployment evidence.

## Relationship to import plans

Every receipt `target` must match a `targetId` in an existing import plan. The receipt `sourceRepo` and `runtime` must match the import plan that owns that target. This prevents receipts from silently attaching evidence to the wrong application, district, institution, or runtime.

## Environment rules

- Preview receipts may have pending or failed validation while work is still being evaluated.
- Staging receipts may have pending or failed validation while acceptance checks are underway.
- Production receipts must have `validation.status: "passed"`, at least one passed health check, a non-empty rollback reference, and a real non-placeholder 40-character commit SHA.

Preview and staging receipts are not required to satisfy production approval rules.

## Prohibited material

Never place secrets, tokens, account IDs, private keys, client data, `.env` contents, or deployment credentials in receipt files. Receipts should reference sealed evidence and rollback records, not embed confidential material.

## Rollback requirements

Production receipts must include a `rollback.reference` pointing to a rollback record, runbook section, prior release, or other auditable rollback authority. Empty rollback references are invalid for production.

## Complete valid example

```json
{
  "schemaVersion": "1.0.0",
  "deploymentId": "mission-control-prod-20260712-001",
  "environment": "production",
  "target": "mission-control-production",
  "sourceRepo": "wiredchaos/mission-control",
  "runtime": "cloudflare-pages",
  "commitSha": "1234567890abcdef1234567890abcdef12345678",
  "validation": {
    "status": "passed",
    "healthChecks": [
      {
        "name": "production-smoke-check",
        "status": "passed",
        "url": "https://example.invalid/health",
        "checkedAt": "2026-07-12T00:00:00Z"
      }
    ]
  },
  "rollback": {
    "reference": "rollback-record:mission-control-prod-20260712-000"
  },
  "notes": "Example only. Do not fabricate live deployment IDs."
}
```
