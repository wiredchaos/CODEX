import type { GatewayRequest, ModelProviderAdapter } from './types';
import { Registry } from './registry';
import { CircuitBreakerStore } from './circuitBreaker';
import { evaluatePolicy } from './policy';

export type Route = { adapter: ModelProviderAdapter; modelId: string; cost: number; trace: string[]; decisions: string[] };

export class RoutingEngine {
  constructor(private registry: Registry, private circuits: CircuitBreakerStore) {}
  async select(req: GatewayRequest, adapters: ModelProviderAdapter[]): Promise<Route> {
    const trace: string[] = [];
    const candidates: Route[] = [];
    for (const adapter of adapters) {
      if (!adapter.supportedOperations.includes(req.operation)) { trace.push(`${adapter.id} rejected: operation unsupported`); continue; }
      const provider = this.registry.provider(adapter.id);
      if (!provider) { trace.push(`${adapter.id} rejected: provider registry missing`); continue; }
      const model = this.registry.models.find(m => m.provider === adapter.id && (req.preferredModel ? m.id === req.preferredModel : true));
      if (!model) { trace.push(`${adapter.id} rejected: model registry missing`); continue; }
      const circuit = this.circuits.get(adapter.id);
      if (['OPEN', 'DISABLED', 'QUARANTINED'].includes(circuit.state)) { trace.push(`${adapter.id} rejected: circuit ${circuit.state}`); continue; }
      if (req.requiredCapabilities?.some(c => !model.capabilities.includes(c))) { trace.push(`${adapter.id} rejected: capability mismatch`); continue; }
      const health = await adapter.healthCheck();
      if (!health.healthy) { trace.push(`${adapter.id} rejected: health check failed`); continue; }
      if (req.maxLatencyMs && health.latencyMs > req.maxLatencyMs) { trace.push(`${adapter.id} rejected: latency estimate ${health.latencyMs}ms exceeds ${req.maxLatencyMs}ms`); continue; }
      const cost = await adapter.estimateCost(req);
      if (req.maxCostUsd !== undefined && cost > req.maxCostUsd) { trace.push(`${adapter.id} rejected: cost ${cost} exceeds ${req.maxCostUsd}`); continue; }
      const policy = evaluatePolicy(req, provider, model, this.registry.right(model.id));
      if (!policy.allowed) { trace.push(`${adapter.id} rejected: ${policy.decisions.join('; ')}`); continue; }
      trace.push(`${adapter.id} accepted: cost ${cost}`);
      candidates.push({ adapter, modelId: model.id, cost, trace: [...trace], decisions: policy.decisions });
    }
    if (!candidates.length) throw Object.assign(new Error('No eligible provider route'), { routeTrace: trace });
    const order = ['deterministic-fallback', 'mock-local', 'mock-cloud'];
    candidates.sort((a, b) => a.cost - b.cost || order.indexOf(a.adapter.id) - order.indexOf(b.adapter.id));
    return { ...candidates[0], trace };
  }
}
