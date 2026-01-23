import assert from 'node:assert/strict';
import { createPR, executePR, finalizePR, routePR, validatePR } from '../index.js';

const basePR = createPR({
  pr_id: 'WC-PR-20250101-0001',
  title: 'Add UI-Context Artifact capture to VisionStruct',
  intent: 'Enable element targeting via selector capture.',
  target: {
    subsystem: 'CREATOR_CODEX',
    module: 'inspector-overlay',
    surface: 'frontend',
  },
  change_type: 'feature',
  constraints: {
    must_not: ['log secrets'],
    must: ['emit receipt artifact'],
    style: ['camelCase'],
    security: ['least privilege'],
  },
  inputs: {
    links: [],
    files: [],
    context_artifacts: [],
  },
  acceptance_tests: ['Given a UI node, when captured, then selectors are exported'],
  risk: {
    data_access: 'low',
    blast_radius: 'single_module',
    user_impact: 'low',
  },
  deliverables: ['code diff', 'docs update'],
  rollback_plan: '',
  owner: 'NEURO',
  timestamp: '2025-01-01T00:00:00.000Z',
});

const validation = validatePR(basePR);
assert.equal(validation.ok, true);

const routing = routePR(basePR);
assert.ok(routing.legs.includes('LEG:VISION_STRUCT'));

const execution = executePR(basePR, validation.riskScore);
assert.equal(execution.artifacts.length, 4);

const receipt = finalizePR(basePR, execution.artifacts, validation.riskScore);
assert.ok(receipt.diffHash.length > 0);
