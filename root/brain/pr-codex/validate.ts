import type { PRObject } from './schema.js';
import { PRSchema } from './schema.js';

export type PRValidationResult = {
  ok: boolean;
  errors: string[];
  riskScore: number;
};

const riskWeights: Record<string, number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
};

const blastWeights: Record<string, number> = {
  single_module: 1,
  subsystem: 2,
  multi_subsystem: 3,
};

export const validatePR = (input: unknown): PRValidationResult => {
  const parsed = PRSchema.safeParse(input);
  const errors: string[] = [];

  if (!parsed.success) {
    parsed.error.issues.forEach((issue) => {
      const path = issue.path.join('.') || 'root';
      errors.push(`${path}: ${issue.message}`);
    });
    return { ok: false, errors, riskScore: 0 };
  }

  const pr = parsed.data;

  if (pr.risk.blast_radius !== 'single_module' && !pr.rollback_plan) {
    errors.push('rollback_plan: required when blast_radius is not single_module');
  }

  const riskScore =
    riskWeights[pr.risk.data_access] +
    riskWeights[pr.risk.user_impact] +
    blastWeights[pr.risk.blast_radius];

  return { ok: errors.length === 0, errors, riskScore };
};

export const assertValidPR = (pr: PRObject): PRValidationResult => {
  return validatePR(pr);
};
