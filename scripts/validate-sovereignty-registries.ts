import { Registry } from '../src/sovereignty/registry';
const registry = new Registry();
for (const model of registry.models) { if (!registry.provider(model.provider)) throw new Error(`missing provider for ${model.id}`); if (!registry.right(model.id)) throw new Error(`missing rights record for ${model.id}`); }
console.log(JSON.stringify({ ok: true, models: registry.models.length, providers: registry.providers.length }));
