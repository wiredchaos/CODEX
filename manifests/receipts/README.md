# Deployment receipts

A deployment receipt is governance evidence for AGENTROPOLIS deployment activity. Receipts belong to the Deployment Authority layer and preserve the architecture boundary: Infrastructure → Districts / Institutions → Applications.

A deployment is not governed until its receipt validates.

## Lifecycle

1. An import plan declares the governed target, source repository, and runtime.
2. A preview, staging, or production activity records a receipt.
3. The receipt is saved as `<deploymentId>.receipt.json` in this directory.
4. Validators confirm JSON syntax, Draft 2020-12 schema compliance, import-plan alignment, deployment ID uniqueness, filename convention, source commit quality, and environment-specific controls.
5. Reviewers use the validated receipt as release evidence. The receipt does not deploy anything by itself.

## Filename convention

Every governed receipt file must be named exactly:

```text
<deploymentId>.receipt.json
```

Template files such as `deployment-receipt.template.json` are examples only and are excluded from validation.

## Import-plan relationship

Each receipt `target` must exist in `manifests/import-plans/*.import-plan.json`. The receipt `sourceRepository` and `runtime` must match that import plan exactly. This prevents receipts from silently authorizing an unrelated application, runtime, or repository.

## Preview rules

Preview receipts must validate structurally and align with an import plan. Preview receipts may have `validation.status` set to `pending`, `passed`, or `failed`, and they are not required to contain passed health checks.

## Staging rules

Staging receipts must validate structurally and align with an import plan. Staging receipts are expected to include useful validation evidence when available, but the validator does not require the full production approval gate.

## Production rules

Production receipts must satisfy all structural and import-plan rules plus these approval controls:

- `validation.status` must be `passed`.
- At least one health check must have `status: "passed"`.
- `rollback.available` must be `true`.
- `rollback.reference` must be non-empty.
- `sourceCommit` must be a real 40-character lowercase hexadecimal SHA and not the all-zero placeholder SHA.

## Rollback expectations

The rollback reference should point to a runbook, manifest, previous deployment receipt, or reversible cutover evidence that a reviewer can use without needing secrets. Do not place private credentials, tokens, account secrets, or production host credentials in receipts.

## Prohibited secret material

Receipts and import plans must not include API keys, access tokens, private keys, Cloudflare secrets, environment variable values, passwords, webhook secrets, wallet seeds, or client-confidential material. Use unmistakable placeholders in examples.

## Validation commands

```bash
pnpm test:governance
pnpm validate:imports
pnpm validate:receipts
pnpm validate
```

## Complete valid preview example

This example uses placeholder identifiers only; it is not a production Cloudflare identifier.

```json
{
  "schemaVersion": "1.0.0",
  "deploymentId": "example-preview-2026-07-12",
  "environment": "preview",
  "target": "example-preview-worker",
  "sourceRepository": "wiredchaos/example-app",
  "sourceCommit": "0123456789abcdef0123456789abcdef01234567",
  "runtime": "cloudflare-pages",
  "validation": {
    "status": "pending",
    "healthChecks": []
  },
  "rollback": {
    "available": true,
    "reference": "example rollback runbook reference"
  },
  "createdAt": "2026-07-12T00:00:00Z",
  "notes": "Example preview receipt only."
}
```

## Complete valid production example

This example uses placeholder identifiers only; it is not a production Cloudflare identifier.

```json
{
  "schemaVersion": "1.0.0",
  "deploymentId": "example-production-2026-07-12",
  "environment": "production",
  "target": "example-preview-worker",
  "sourceRepository": "wiredchaos/example-app",
  "sourceCommit": "fedcba9876543210fedcba9876543210fedcba98",
  "runtime": "cloudflare-pages",
  "validation": {
    "status": "passed",
    "healthChecks": [
      {
        "name": "example HTTPS smoke check",
        "status": "passed",
        "checkedAt": "2026-07-12T00:05:00Z",
        "evidence": "example evidence reference"
      }
    ],
    "evidence": ["example CI validation artifact"]
  },
  "rollback": {
    "available": true,
    "reference": "example rollback runbook reference"
  },
  "createdAt": "2026-07-12T00:10:00Z",
  "notes": "Example production receipt only."
}
```
