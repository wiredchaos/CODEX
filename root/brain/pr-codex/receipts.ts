import { createHash } from 'crypto';
import type { PRObject } from './schema.js';
import type { ExecutionArtifacts } from './executor-adapter.js';
import { routePR } from './router.js';

export type PRReceipt = {
  pr_id: string;
  routing: string[];
  requiredReviews: string[];
  riskScore: number;
  diffHash: string;
  approvalChain: string[];
  initiatingIdentity: string;
  subsystemScope: string;
};

export const buildDiffHash = (artifacts: ExecutionArtifacts[]): string => {
  const payload = JSON.stringify(artifacts);
  return createHash('sha256').update(payload).digest('hex');
};

export const finalizePR = (pr: PRObject, artifacts: ExecutionArtifacts[], riskScore: number): PRReceipt => {
  const routing = routePR(pr);
  const diffHash = buildDiffHash(artifacts);

  return {
    pr_id: pr.pr_id,
    routing: routing.legs,
    requiredReviews: routing.requiredReviews,
    riskScore,
    diffHash,
    approvalChain: routing.requiredReviews,
    initiatingIdentity: pr.owner,
    subsystemScope: pr.target.subsystem,
  };
};
