#!/usr/bin/env node
import { validateImportPlans } from '../lib/validate-import-plans.mjs';
const errors = await validateImportPlans();
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('Import plans validated.');
