import type { PRObject } from './schema.js';

export type RoutingResult = {
  legs: string[];
  agents: string[];
  requiredReviews: string[];
  safeguards: string[];
};

const legMap = new Map<string, string>([
  ['remotion', 'LEG:MOTION_FORGE'],
  ['frontend', 'LEG:VISION_STRUCT'],
  ['backend', 'LEG:SWARM_COORD'],
  ['prompts', 'LEG:AKASHIC_ENGINE'],
  ['infra', 'LEG:SWARM_COORD'],
  ['docs', 'LEG:SWARM_COORD'],
]);

export const routePR = (pr: PRObject): RoutingResult => {
  const legs = new Set<string>();
  const requiredReviews = new Set<string>();
  const safeguards = new Set<string>();

  const surfaceLeg = legMap.get(pr.target.surface);
  if (surfaceLeg) {
    legs.add(surfaceLeg);
  }

  if (pr.target.subsystem === 'TAX_SUITE' || pr.target.subsystem === 'TRUST_SUITE') {
    legs.add('LEG:TAX_TRUST');
  }

  if (pr.target.subsystem === 'AKIRA_CODEX' || pr.target.subsystem === 'NPC') {
    legs.add('LEG:AKASHIC_ENGINE');
  }

  if (pr.target.subsystem === 'FEN') {
    legs.add('LEG:FEN_ENGINE');
  }

  const isHighRisk = pr.risk.user_impact === 'high' || pr.risk.data_access === 'high';
  if (isHighRisk) {
    requiredReviews.add('LEG:ANTI_MOLOCH');
    safeguards.add('explicit sandbox execution');
    safeguards.add('diff summary required');
    safeguards.add('test evidence required');
    safeguards.add('rollback plan present');
  }

  if (pr.change_type === 'security') {
    requiredReviews.add('LEG:ANTI_MOLOCH');
  }

  return {
    legs: Array.from(legs),
    agents: Array.from(legs),
    requiredReviews: Array.from(requiredReviews),
    safeguards: Array.from(safeguards),
  };
};
