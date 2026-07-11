import type { EvaluationResult, GatewayRequest } from './types';
import { ModelGateway } from './gateway';
export const evaluationTests: { id: string; request: GatewayRequest }[] = [
  { id: 'district-routing', request: { operation: 'generate', input: 'route to district', requiredCapabilities: ['district-routing'], dataClassification: 'public' } },
  { id: 'restricted-data-local-only-routing', request: { operation: 'reason', input: 'restricted canon', dataClassification: 'restricted' } },
  { id: 'cost-ceiling-compliance', request: { operation: 'generate', input: 'cheap', maxCostUsd: 0.001, dataClassification: 'public' } },
  { id: 'deterministic-emergency-fallback', request: { operation: 'moderate', input: 'status', allowCloud: false, allowLocal: true, maxLatencyMs: 10, dataClassification: 'restricted' } }
];
export async function runEvaluations(gateway: ModelGateway): Promise<EvaluationResult[]> { const out: EvaluationResult[] = []; for (const test of evaluationTests) { const t = Date.now(); const violations: string[] = []; try { const r = await gateway.execute(test.request, 'evaluation-arena'); out.push({ testId: test.id, modelId: r.model, passed: true, score: 1, latencyMs: Date.now() - t, estimatedCostUsd: r.estimatedCostUsd, violations, notes: ['mock evaluation output; not a real model quality claim'], timestamp: new Date().toISOString() }); } catch (e) { out.push({ testId: test.id, modelId: 'none', passed: false, score: 0, latencyMs: Date.now() - t, estimatedCostUsd: 0, violations: [(e as Error).message], notes: ['mock evaluation output'], timestamp: new Date().toISOString() }); } } return out; }
