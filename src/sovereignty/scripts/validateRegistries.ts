import { loadRegistries, validateRegistries } from '../registry.js';
const result = validateRegistries(loadRegistries());
console.log(`Sovereignty registry counts: models=${result.counts.models} providers=${result.counts.providers} hardware=${result.counts.hardware} rights=${result.counts.rights} jurisdictions=${result.counts.jurisdictions}`);
if (!result.ok) { console.error(result.errors.join('\n')); process.exit(1); }
