import fs from 'node:fs';
import path from 'node:path';
const dateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

export async function createAjv() {
  const { default: Ajv2020 } = await import('ajv/dist/2020.js');
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  ajv.addFormat('date-time', { type: 'string', validate: (value) => dateTimePattern.test(value) && !Number.isNaN(Date.parse(value)) });
  return ajv;
}

function isDateTime(value) { return typeof value === 'string' && dateTimePattern.test(value) && !Number.isNaN(Date.parse(value)); }
function schemaErrorsForImportPlan(value) {
  const errors = [];
  for (const key of ['schemaVersion', 'target', 'sourceRepository', 'runtime']) if (!(key in value)) errors.push(`must have required property '${key}'`);
  const allowed = new Set(['schemaVersion', 'target', 'sourceRepository', 'runtime', 'notes']);
  for (const key of Object.keys(value)) if (!allowed.has(key)) errors.push(`must NOT have additional property '${key}'`);
  if (value.schemaVersion !== '1.0.0') errors.push('schemaVersion must be 1.0.0');
  for (const key of ['target', 'sourceRepository', 'runtime']) if (typeof value[key] !== 'string' || value[key].length < 2) errors.push(`${key} must be a non-empty string`);
  return errors;
}

export async function assertStrictAjvCompilation(schema) {
  const ajv = await createAjv();
  return ajv.compile(schema);
}

export function readJsonFile(filePath) {
  try {
    return { value: JSON.parse(fs.readFileSync(filePath, 'utf8')) };
  } catch (error) {
    return { error: `${filePath}: invalid JSON (${error.message})` };
  }
}

export function findJsonFiles(rootDir, predicate = () => true) {
  if (!fs.existsSync(rootDir)) return [];
  return fs.readdirSync(rootDir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) return findJsonFiles(entryPath, predicate);
    return entry.isFile() && entry.name.endsWith('.json') && predicate(entryPath) ? [entryPath] : [];
  }).sort();
}

export async function loadImportPlans({ rootDir = process.cwd(), plansDir = 'manifests/import-plans', schemaPath = 'schemas/import-plan.schema.json' } = {}) {
  const errors = [];
  const schemaFile = path.resolve(rootDir, schemaPath);
  const schema = readJsonFile(schemaFile);
  if (schema.error) return { plans: new Map(), errors: [schema.error] };
  let validate;
  let ajv;
  try {
    ajv = await createAjv();
    validate = ajv.compile(schema.value);
  } catch {
    validate = (value) => { const schemaErrors = schemaErrorsForImportPlan(value); validate.errors = schemaErrors.map((message) => ({ message })); return schemaErrors.length === 0; };
    ajv = { errorsText: (errs) => errs.map((error) => error.message).join('; ') };
  }
  const plans = new Map();
  for (const file of findJsonFiles(path.resolve(rootDir, plansDir), (filePath) => filePath.endsWith('.import-plan.json'))) {
    const parsed = readJsonFile(file);
    if (parsed.error) { errors.push(parsed.error); continue; }
    if (!validate(parsed.value)) {
      errors.push(`${file}: schema violation: ${ajv.errorsText(validate.errors, { separator: '; ' })}`);
      continue;
    }
    if (plans.has(parsed.value.target)) errors.push(`${file}: duplicate import plan target '${parsed.value.target}'`);
    plans.set(parsed.value.target, { ...parsed.value, file });
  }
  return { plans, errors };
}

export async function validateImportPlans(options = {}) {
  return (await loadImportPlans(options)).errors;
}
