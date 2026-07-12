import path from 'node:path';
import { createAjv, findJsonFiles, loadImportPlans, readJsonFile } from './validate-import-plans.mjs';

const ZERO_SHA = /^0{40}$/;
const SHA = /^[a-f0-9]{40}$/;
const DT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
function schemaErrorsForReceipt(value) {
  const errors = [];
  const required = ['schemaVersion','deploymentId','environment','target','sourceRepository','sourceCommit','runtime','validation','rollback','createdAt'];
  for (const key of required) if (!(key in value)) errors.push(`must have required property '${key}'`);
  const allowed = new Set([...required, 'notes']);
  for (const key of Object.keys(value)) if (!allowed.has(key)) errors.push(`must NOT have additional property '${key}'`);
  if (value.schemaVersion !== '1.0.0') errors.push('schemaVersion must be 1.0.0');
  if (!['preview','staging','production'].includes(value.environment)) errors.push('environment must be preview, staging, or production');
  if (!SHA.test(value.sourceCommit || '')) errors.push('sourceCommit must match 40 lowercase hexadecimal characters');
  if (!DT.test(value.createdAt || '')) errors.push('createdAt must be date-time');
  if (!value.validation || typeof value.validation !== 'object') errors.push('validation must be object');
  else { if (!['pending','passed','failed'].includes(value.validation.status)) errors.push('validation.status is invalid'); if (!Array.isArray(value.validation.healthChecks)) errors.push('validation.healthChecks must be array'); }
  if (!value.rollback || typeof value.rollback !== 'object') errors.push('rollback must be object');
  else { if (typeof value.rollback.available !== 'boolean') errors.push('rollback.available must be boolean'); if (typeof value.rollback.reference !== 'string') errors.push('rollback.reference must be string'); }
  return errors;
}


export async function validateDeploymentReceipts({ rootDir = process.cwd(), receiptsDir = 'manifests/receipts', receiptSchemaPath = 'schemas/deployment-receipt.schema.json', plansDir = 'manifests/import-plans', planSchemaPath = 'schemas/import-plan.schema.json' } = {}) {
  const errors = [];
  const schemaFile = path.resolve(rootDir, receiptSchemaPath);
  const schema = readJsonFile(schemaFile);
  if (schema.error) return [schema.error];
  let validate;
  let ajv;
  try {
    ajv = await createAjv();
    validate = ajv.compile(schema.value);
  } catch {
    validate = (value) => { const schemaErrors = schemaErrorsForReceipt(value); validate.errors = schemaErrors.map((message) => ({ message })); return schemaErrors.length === 0; };
    ajv = { errorsText: (errs) => errs.map((error) => error.message).join('; ') };
  }
  const { plans, errors: planErrors } = await loadImportPlans({ rootDir, plansDir, schemaPath: planSchemaPath });
  errors.push(...planErrors);
  const ids = new Map();
  const files = findJsonFiles(path.resolve(rootDir, receiptsDir), (filePath) => {
    const base = path.basename(filePath);
    return base.endsWith('.receipt.json') && !base.includes('template');
  });
  for (const file of files) {
    const parsed = readJsonFile(file);
    if (parsed.error) { errors.push(parsed.error); continue; }
    const receipt = parsed.value;
    if (!validate(receipt)) {
      errors.push(`${file}: schema violation: ${ajv.errorsText(validate.errors, { separator: '; ' })}`);
      continue;
    }
    if (ids.has(receipt.deploymentId)) errors.push(`${file}: duplicate deploymentId '${receipt.deploymentId}' also used by ${ids.get(receipt.deploymentId)}`);
    ids.set(receipt.deploymentId, file);
    const expectedFile = `${receipt.deploymentId}.receipt.json`;
    if (path.basename(file) !== expectedFile) errors.push(`${file}: filename must equal '${expectedFile}'`);
    const plan = plans.get(receipt.target);
    if (!plan) {
      errors.push(`${file}: target '${receipt.target}' does not exist in an import plan`);
    } else {
      if (receipt.sourceRepository !== plan.sourceRepository) errors.push(`${file}: sourceRepository '${receipt.sourceRepository}' does not match import plan '${plan.sourceRepository}'`);
      if (receipt.runtime !== plan.runtime) errors.push(`${file}: runtime '${receipt.runtime}' does not match import plan '${plan.runtime}'`);
    }
    if (ZERO_SHA.test(receipt.sourceCommit)) errors.push(`${file}: sourceCommit must not be the all-zero placeholder SHA`);
    if (receipt.environment === 'production') {
      if (receipt.validation.status !== 'passed') errors.push(`${file}: production validation.status must be 'passed'`);
      if (!receipt.validation.healthChecks.some((check) => check.status === 'passed')) errors.push(`${file}: production receipts must contain at least one passed health check`);
      if (receipt.rollback.available !== true) errors.push(`${file}: production rollback.available must be true`);
      if (!receipt.rollback.reference.trim()) errors.push(`${file}: production rollback.reference must be non-empty`);
    }
  }
  return errors;
}
