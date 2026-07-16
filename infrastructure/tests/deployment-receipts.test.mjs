import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateDeploymentReceipts } from '../lib/validate-deployment-receipts.mjs';

const validSha = 'abcdefabcdefabcdefabcdefabcdefabcdefabcd';
const validDate = '2026-07-12T00:00:00Z';

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'receipt-governance-'));
  fs.mkdirSync(path.join(root, 'schemas'), { recursive: true });
  fs.mkdirSync(path.join(root, 'manifests/import-plans'), { recursive: true });
  fs.mkdirSync(path.join(root, 'manifests/receipts'), { recursive: true });
  fs.copyFileSync('schemas/deployment-receipt.schema.json', path.join(root, 'schemas/deployment-receipt.schema.json'));
  fs.copyFileSync('schemas/import-plan.schema.json', path.join(root, 'schemas/import-plan.schema.json'));
  writeJson(root, 'manifests/import-plans/example.import-plan.json', {
    schemaVersion: '1.0.0',
    target: 'example-worker',
    sourceRepository: 'wiredchaos/example-app',
    runtime: 'cloudflare-pages'
  });
  return root;
}

function receipt(overrides = {}) {
  return {
    schemaVersion: '1.0.0',
    deploymentId: overrides.deploymentId ?? 'example-preview-2026-07-12',
    environment: overrides.environment ?? 'preview',
    target: overrides.target ?? 'example-worker',
    sourceRepository: overrides.sourceRepository ?? 'wiredchaos/example-app',
    sourceCommit: overrides.sourceCommit ?? validSha,
    runtime: overrides.runtime ?? 'cloudflare-pages',
    validation: overrides.validation ?? { status: 'pending', healthChecks: [] },
    rollback: overrides.rollback ?? { available: true, reference: 'rollback/runbook/example' },
    createdAt: validDate
  };
}

function writeJson(root, relativePath, value) {
  const file = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
  return file;
}

async function validate(root) {
  return validateDeploymentReceipts({ rootDir: root });
}

test('valid preview receipt', async () => {
  const root = fixture();
  writeJson(root, 'manifests/receipts/example-preview-2026-07-12.receipt.json', receipt());
  assert.deepEqual(await validate(root), []);
});

test('valid staging receipt', async () => {
  const root = fixture();
  const value = receipt({ deploymentId: 'example-staging-2026-07-12', environment: 'staging' });
  writeJson(root, 'manifests/receipts/example-staging-2026-07-12.receipt.json', value);
  assert.deepEqual(await validate(root), []);
});

test('valid production receipt', async () => {
  const root = fixture();
  const value = receipt({ deploymentId: 'example-production-2026-07-12', environment: 'production', validation: { status: 'passed', healthChecks: [{ name: 'https smoke', status: 'passed', checkedAt: validDate }] } });
  writeJson(root, 'manifests/receipts/example-production-2026-07-12.receipt.json', value);
  assert.deepEqual(await validate(root), []);
});

test('malformed JSON', async () => {
  const root = fixture();
  fs.writeFileSync(path.join(root, 'manifests/receipts/bad.receipt.json'), '{');
  assert.match((await validate(root)).join('\n'), /invalid JSON/);
});

test('schema violation', async () => {
  const root = fixture();
  const value = receipt();
  delete value.createdAt;
  writeJson(root, 'manifests/receipts/example-preview-2026-07-12.receipt.json', value);
  assert.match((await validate(root)).join('\n'), /schema violation/);
});

test('duplicate deployment ID', async () => {
  const root = fixture();
  writeJson(root, 'manifests/receipts/example-preview-2026-07-12.receipt.json', receipt());
  writeJson(root, 'manifests/receipts/other.receipt.json', receipt());
  assert.match((await validate(root)).join('\n'), /duplicate deploymentId/);
});

test('filename mismatch', async () => {
  const root = fixture();
  writeJson(root, 'manifests/receipts/wrong.receipt.json', receipt());
  assert.match((await validate(root)).join('\n'), /filename must equal/);
});

test('unknown target', async () => {
  const root = fixture();
  writeJson(root, 'manifests/receipts/example-preview-2026-07-12.receipt.json', receipt({ target: 'missing-worker' }));
  assert.match((await validate(root)).join('\n'), /does not exist in an import plan/);
});

test('source repository mismatch', async () => {
  const root = fixture();
  writeJson(root, 'manifests/receipts/example-preview-2026-07-12.receipt.json', receipt({ sourceRepository: 'wiredchaos/wrong' }));
  assert.match((await validate(root)).join('\n'), /sourceRepository/);
});

test('runtime mismatch', async () => {
  const root = fixture();
  writeJson(root, 'manifests/receipts/example-preview-2026-07-12.receipt.json', receipt({ runtime: 'wrangler-worker' }));
  assert.match((await validate(root)).join('\n'), /runtime/);
});

test('production status not passed', async () => {
  const root = fixture();
  writeJson(root, 'manifests/receipts/example-production-2026-07-12.receipt.json', receipt({ deploymentId: 'example-production-2026-07-12', environment: 'production' }));
  assert.match((await validate(root)).join('\n'), /validation.status/);
});

test('production receipt without a passed health check', async () => {
  const root = fixture();
  const value = receipt({ deploymentId: 'example-production-2026-07-12', environment: 'production', validation: { status: 'passed', healthChecks: [{ name: 'smoke', status: 'failed', checkedAt: validDate }] } });
  writeJson(root, 'manifests/receipts/example-production-2026-07-12.receipt.json', value);
  assert.match((await validate(root)).join('\n'), /at least one passed health check/);
});

test('placeholder source commit', async () => {
  const root = fixture();
  writeJson(root, 'manifests/receipts/example-preview-2026-07-12.receipt.json', receipt({ sourceCommit: '0000000000000000000000000000000000000000' }));
  assert.match((await validate(root)).join('\n'), /all-zero placeholder/);
});

test('missing rollback reference', async () => {
  const root = fixture();
  const value = receipt({ deploymentId: 'example-production-2026-07-12', environment: 'production', validation: { status: 'passed', healthChecks: [{ name: 'smoke', status: 'passed', checkedAt: validDate }] }, rollback: { available: true, reference: ' ' } });
  writeJson(root, 'manifests/receipts/example-production-2026-07-12.receipt.json', value);
  assert.match((await validate(root)).join('\n'), /rollback.reference/);
});

test('template file ignored', async () => {
  const root = fixture();
  writeJson(root, 'manifests/receipts/deployment-receipt.template.json', { invalid: true });
  assert.deepEqual(await validate(root), []);
});
