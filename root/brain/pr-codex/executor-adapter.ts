import type { PRObject } from './schema.js';
import { routePR } from './router.js';

export type PlanArtifact = {
  type: 'plan';
  steps: string[];
  filesTouched: string[];
  toolCalls: string[];
  expectedOutputs: string[];
};

export type ChangeArtifact = {
  type: 'change';
  diffs: string[];
  generatedArtifacts: string[];
};

export type TestArtifact = {
  type: 'test';
  checks: string[];
  evidence: string[];
};

export type ReceiptArtifact = {
  type: 'receipt';
  pr_id: string;
  routing: string[];
  riskScore: number;
  diffHash: string;
};

export type ExecutionArtifacts =
  | PlanArtifact
  | ChangeArtifact
  | TestArtifact
  | ReceiptArtifact;

export type ExecutionResult = {
  artifacts: ExecutionArtifacts[];
};

export const executePR = (pr: PRObject, riskScore: number): ExecutionResult => {
  const routing = routePR(pr);

  const plan: PlanArtifact = {
    type: 'plan',
    steps: [
      'Normalize and validate PR object',
      `Route PR to legs: ${routing.legs.join(', ')}`,
      'Generate change plan and update artifacts',
      'Record audit log entry',
    ],
    filesTouched: [],
    toolCalls: [],
    expectedOutputs: ['Plan Artifact', 'Change Artifact', 'Test Artifact', 'Receipt Artifact'],
  };

  const change: ChangeArtifact = {
    type: 'change',
    diffs: [],
    generatedArtifacts: [],
  };

  const test: TestArtifact = {
    type: 'test',
    checks: pr.acceptance_tests,
    evidence: [],
  };

  const receipt: ReceiptArtifact = {
    type: 'receipt',
    pr_id: pr.pr_id,
    routing: routing.legs,
    riskScore,
    diffHash: '',
  };

  return { artifacts: [plan, change, test, receipt] };
};
