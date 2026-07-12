/* eslint-env node */
import Ajv from 'ajv/dist/2020.js';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const receiptsDir = process.env.RECEIPTS_DIR ?? path.join(root, 'manifests/receipts');
const importPlansDir = process.env.IMPORT_PLANS_DIR ?? path.join(root, 'manifests/import-plans');
const receiptSchemaPath = path.join(root, 'schemas/deployment-receipt.schema.json');
const importPlanSchemaPath = path.join(root, 'schemas/import-plan.schema.json');

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function listFiles(dir, suffix) {
  try {
    return (await readdir(dir, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith(suffix))
      .map((entry) => path.join(dir, entry.name));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

function formatAjvErrors(validate) {
  return validate.errors?.map((error) => `${error.instancePath || '/'} ${error.message}`).join('; ') ?? 'unknown schema error';
}

const ajv = new Ajv({ strict: true, allErrors: true });
const validateReceiptSchema = ajv.compile(await readJson(receiptSchemaPath));
const validateImportPlanSchema = ajv.compile(await readJson(importPlanSchemaPath));
const errors = [];
const targets = new Map();

for (const file of await listFiles(importPlansDir, '.import-plan.json')) {
  try {
    const plan = await readJson(file);
    if (!validateImportPlanSchema(plan)) {
      errors.push(`${path.relative(root, file)} violates import plan schema: ${formatAjvErrors(validateImportPlanSchema)}`);
      continue;
    }
    for (const target of plan.targets) {
      if (targets.has(target.targetId)) {
        errors.push(`Import target '${target.targetId}' is declared more than once.`);
      }
      targets.set(target.targetId, {
        sourceRepo: plan.sourceRepo,
        runtime: plan.runtime,
        environment: target.environment,
        planId: plan.planId
      });
    }
  } catch (error) {
    errors.push(`${path.relative(root, file)} is not valid JSON: ${error.message}`);
  }
}

const deploymentIds = new Map();
const receiptFiles = await listFiles(receiptsDir, '.receipt.json');

for (const file of receiptFiles) {
  const rel = path.relative(root, file);
  let receipt;
  try {
    receipt = await readJson(file);
  } catch (error) {
    errors.push(`${rel} is not valid JSON: ${error.message}`);
    continue;
  }

  if (!validateReceiptSchema(receipt)) {
    errors.push(`${rel} violates deployment receipt schema: ${formatAjvErrors(validateReceiptSchema)}`);
    continue;
  }

  const expectedName = `${receipt.deploymentId}.receipt.json`;
  if (path.basename(file) !== expectedName) {
    errors.push(`${rel} filename must be '${expectedName}' to match deploymentId '${receipt.deploymentId}'.`);
  }

  const previous = deploymentIds.get(receipt.deploymentId);
  if (previous) {
    errors.push(`Duplicate deploymentId '${receipt.deploymentId}' appears in ${previous} and ${rel}.`);
  } else {
    deploymentIds.set(receipt.deploymentId, rel);
  }

  const target = targets.get(receipt.target);
  if (!target) {
    errors.push(`${rel} target '${receipt.target}' does not match any manifests/import-plans/*.import-plan.json targetId.`);
  } else {
    if (receipt.sourceRepo !== target.sourceRepo) {
      errors.push(`${rel} sourceRepo '${receipt.sourceRepo}' must match import plan '${target.planId}' sourceRepo '${target.sourceRepo}'.`);
    }
    if (receipt.runtime !== target.runtime) {
      errors.push(`${rel} runtime '${receipt.runtime}' must match import plan '${target.planId}' runtime '${target.runtime}'.`);
    }
    if (receipt.environment !== target.environment) {
      errors.push(`${rel} environment '${receipt.environment}' must match import target '${receipt.target}' environment '${target.environment}'.`);
    }
  }

  if (receipt.environment === 'production') {
    if (receipt.validation.status !== 'passed') {
      errors.push(`${rel} production receipt validation.status must be 'passed'.`);
    }
    if (!receipt.validation.healthChecks.some((check) => check.status === 'passed')) {
      errors.push(`${rel} production receipt must include at least one passed health check.`);
    }
    if (receipt.rollback.reference.trim().length === 0) {
      errors.push(`${rel} production receipt must include a non-empty rollback.reference.`);
    }
    if (/^(0{40}|f{40}|deadbeefdeadbeefdeadbeefdeadbeefdeadbeef)$/.test(receipt.commitSha)) {
      errors.push(`${rel} production receipt commitSha must be a real non-placeholder 40-character SHA.`);
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Validated ${receiptFiles.length} deployment receipt(s).`);
