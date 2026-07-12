/* eslint-env node */
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const validator = path.join(root, 'infrastructure/scripts/validate-deployment-receipts.mjs');

const plan = {
  schemaVersion: '1.0.0',
  planId: 'mission-control-cloudflare-pages',
  sourceRepo: 'wiredchaos/mission-control',
  runtime: 'cloudflare-pages',
  targets: [
    { targetId: 'mission-control-preview', environment: 'preview' },
    { targetId: 'mission-control-production', environment: 'production' }
  ]
};

const baseReceipt = {
  schemaVersion: '1.0.0',
  deploymentId: 'deploy-preview-001',
  environment: 'preview',
  target: 'mission-control-preview',
  sourceRepo: 'wiredchaos/mission-control',
  runtime: 'cloudflare-pages',
  commitSha: '1234567890abcdef1234567890abcdef12345678',
  validation: { status: 'pending', healthChecks: [] },
  rollback: { reference: '' }
};

function productionReceipt(overrides = {}) {
  return {
    ...baseReceipt,
    deploymentId: 'deploy-production-001',
    environment: 'production',
    target: 'mission-control-production',
    validation: { status: 'passed', healthChecks: [{ name: 'smoke', status: 'passed' }] },
    rollback: { reference: 'rollback-record-001' },
    ...overrides
  };
}

async function fixture() {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'receipt-validator-'));
  const receiptsDir = path.join(dir, 'receipts');
  const plansDir = path.join(dir, 'plans');
  await mkdir(receiptsDir, { recursive: true });
  await mkdir(plansDir, { recursive: true });
  await writeFile(path.join(plansDir, 'mission-control.import-plan.json'), JSON.stringify(plan, null, 2));
  return { dir, receiptsDir, plansDir };
}

async function run(receipts) {
  const fx = await fixture();
  await Promise.all(Object.entries(receipts).map(([name, body]) => writeFile(path.join(fx.receiptsDir, name), typeof body === 'string' ? body : JSON.stringify(body, null, 2))));
  const result = spawnSync(process.execPath, [validator], {
    cwd: root,
    env: { ...process.env, RECEIPTS_DIR: fx.receiptsDir, IMPORT_PLANS_DIR: fx.plansDir },
    encoding: 'utf8'
  });
  return { ...result, output: `${result.stdout}${result.stderr}` };
}

const cases = [
  ['valid preview receipt', async () => assert.equal((await run({ 'deploy-preview-001.receipt.json': baseReceipt })).status, 0)],
  ['valid production receipt', async () => assert.equal((await run({ 'deploy-production-001.receipt.json': productionReceipt() })).status, 0)],
  ['malformed JSON', async () => assert.match((await run({ 'bad.receipt.json': '{' })).output, /not valid JSON/)],
  ['schema violation', async () => assert.match((await run({ 'deploy-preview-001.receipt.json': { ...baseReceipt, runtime: 'bad' } })).output, /violates deployment receipt schema/)],
  ['duplicate deployment ID', async () => assert.match((await run({ 'deploy-preview-001.receipt.json': baseReceipt, 'copy.receipt.json': baseReceipt })).output, /Duplicate deploymentId/)],
  ['mismatched filename', async () => assert.match((await run({ 'wrong.receipt.json': baseReceipt })).output, /filename must be/)],
  ['unknown target', async () => assert.match((await run({ 'deploy-preview-001.receipt.json': { ...baseReceipt, target: 'unknown-target' } })).output, /does not match any/)],
  ['source repository mismatch', async () => assert.match((await run({ 'deploy-preview-001.receipt.json': { ...baseReceipt, sourceRepo: 'wiredchaos/other' } })).output, /sourceRepo .* must match/)],
  ['runtime mismatch', async () => assert.match((await run({ 'deploy-preview-001.receipt.json': { ...baseReceipt, runtime: 'cloudflare-workers' } })).output, /runtime .* must match/)],
  ['production receipt with failed validation', async () => assert.match((await run({ 'deploy-production-001.receipt.json': productionReceipt({ validation: { status: 'failed', healthChecks: [{ name: 'smoke', status: 'passed' }] } }) })).output, /validation.status must be 'passed'/)],
  ['placeholder commit SHA', async () => assert.match((await run({ 'deploy-production-001.receipt.json': productionReceipt({ commitSha: '0000000000000000000000000000000000000000' }) })).output, /non-placeholder/)],
  ['missing passed health check', async () => assert.match((await run({ 'deploy-production-001.receipt.json': productionReceipt({ validation: { status: 'passed', healthChecks: [{ name: 'smoke', status: 'failed' }] } }) })).output, /at least one passed health check/)]
];

for (const [name, test] of cases) {
  await test();
  console.log(`ok - ${name}`);
}
