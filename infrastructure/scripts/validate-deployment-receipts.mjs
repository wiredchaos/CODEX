#!/usr/bin/env node
import { validateDeploymentReceipts } from '../lib/validate-deployment-receipts.mjs';
const errors = await validateDeploymentReceipts();
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('Deployment receipts validated.');
