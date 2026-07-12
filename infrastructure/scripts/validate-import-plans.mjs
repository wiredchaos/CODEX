/* eslint-env node */
import Ajv from 'ajv/dist/2020.js';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const schemaPath = path.join(root, 'schemas/import-plan.schema.json');
const plansDir = path.join(root, 'manifests/import-plans');

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

const ajv = new Ajv({ strict: true, allErrors: true });
const validate = ajv.compile(await readJson(schemaPath));
const files = await listFiles(plansDir, '.import-plan.json');
const errors = [];

for (const file of files) {
  try {
    const plan = await readJson(file);
    if (!validate(plan)) {
      errors.push(`${path.relative(root, file)} violates import plan schema: ${ajv.errorsText(validate.errors, { separator: '; ' })}`);
    }
  } catch (error) {
    errors.push(`${path.relative(root, file)} is not valid JSON: ${error.message}`);
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Validated ${files.length} import plan(s).`);
