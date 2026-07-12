import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import type { Registries } from './types.js';

const keys = ['models', 'providers', 'hardware', 'rights', 'jurisdictions'] as const;
const schemaFiles: Record<(typeof keys)[number], string> = {
  models: 'model.schema.json',
  providers: 'provider.schema.json',
  hardware: 'hardware.schema.json',
  rights: 'rights.schema.json',
  jurisdictions: 'jurisdiction.schema.json'
};

export function loadRegistries(root = 'registry/sovereignty'): Registries {
  const out: Partial<Registries> = {};
  for (const key of keys) {
    out[key] = readdirSync(join(root, key))
      .filter((file) => file.endsWith('.json'))
      .map((file) => JSON.parse(readFileSync(join(root, key, file), 'utf8')));
  }
  return out as Registries;
}

function validUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function validDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function schemaValidators(schemaRoot = 'schemas/sovereignty') {
  const ajv = new Ajv2020({ allErrors: true, strict: false, validateFormats: false });
  return Object.fromEntries(
    keys.map((key) => {
      const schema = JSON.parse(readFileSync(join(schemaRoot, schemaFiles[key]), 'utf8'));
      return [key, ajv.compile(schema)];
    })
  ) as Record<(typeof keys)[number], ReturnType<Ajv2020['compile']>>;
}

export function validateRegistries(
  reg: Registries,
  now = Date.now(),
  schemaRoot = 'schemas/sovereignty'
): { ok: boolean; errors: string[]; counts: Record<string, number> } {
  const errors: string[] = [];
  const counts: Record<string, number> = {};
  const validators = schemaValidators(schemaRoot);

  for (const key of keys) {
    counts[key] = reg[key].length;
    const seen = new Set<string>();

    for (const record of reg[key] as Array<Record<string, unknown>>) {
      const validate = validators[key];
      if (!validate(record)) {
        for (const issue of validate.errors ?? []) {
          errors.push(`${key}/${String(record.id ?? 'unknown')}${issue.instancePath || '/'}: ${issue.message}`);
        }
      }

      if (typeof record.id === 'string') {
        if (seen.has(record.id)) errors.push(`${key}: duplicate id ${record.id}`);
        seen.add(record.id);
      }
    }
  }

  const sets = Object.fromEntries(
    keys.map((key) => [key, new Set((reg[key] as Array<{ id: string }>).map((record) => record.id))])
  ) as Record<(typeof keys)[number], Set<string>>;

  for (const model of reg.models) {
    if (!sets.providers.has(model.providerId)) errors.push(`models/${model.id}: missing provider ${model.providerId}`);
    if (!sets.rights.has(model.rightsId)) errors.push(`models/${model.id}: missing rights ${model.rightsId}`);
    if (model.hardwareId && !sets.hardware.has(model.hardwareId)) errors.push(`models/${model.id}: missing hardware ${model.hardwareId}`);
  }

  for (const provider of reg.providers) {
    if (!sets.jurisdictions.has(provider.jurisdictionId)) {
      errors.push(`providers/${provider.id}: missing jurisdiction ${provider.jurisdictionId}`);
    }
    if (!validUrl(provider.endpointUrl)) errors.push(`providers/${provider.id}: malformed URL`);
  }

  for (const hardware of reg.hardware) {
    if (!sets.providers.has(hardware.providerId)) {
      errors.push(`hardware/${hardware.id}: missing provider ${hardware.providerId}`);
    }
  }

  for (const rights of reg.rights) {
    if (!validUrl(rights.evidenceUrl)) errors.push(`rights/${rights.id}: malformed URL`);
    if (!validDate(rights.reviewDate)) {
      errors.push(`rights/${rights.id}: malformed review date`);
    } else if (Date.parse(`${rights.reviewDate}T23:59:59Z`) < now) {
      errors.push(`rights/${rights.id}: expired review date`);
    }
  }

  return { ok: errors.length === 0, errors, counts };
}
