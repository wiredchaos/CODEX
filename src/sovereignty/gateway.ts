import crypto from 'node:crypto';
import type { GatewayRequest, GatewayResponse, ModelProviderAdapter } from './types';
import { Registry } from './registry';
import { CircuitBreakerStore } from './circuitBreaker';
import { RoutingEngine } from './router';
import { AuditLog, TelemetryStore } from './telemetry';

export class ModelGateway {
  private router: RoutingEngine;
  constructor(private adapters: ModelProviderAdapter[], private registry = new Registry(), private circuits = new CircuitBreakerStore(), private telemetry = new TelemetryStore(), private audit = new AuditLog()) { this.router = new RoutingEngine(registry, circuits); }
  async execute(request: GatewayRequest, caller = 'anonymous'): Promise<GatewayResponse> {
    const requestId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    try {
      const route = await this.router.select(request, this.adapters);
      const started = Date.now();
      const result = await route.adapter.execute(request);
      const latencyMs = Date.now() - started || result.latencyMs;
      const response: GatewayResponse = { requestId, provider: route.adapter.id, model: result.model, operation: request.operation, output: result.output, latencyMs, estimatedCostUsd: result.estimatedCostUsd, fallbackUsed: route.adapter.id === 'deterministic-fallback', routeTrace: route.trace, policyDecisions: route.decisions, modelVersion: result.modelVersion, timestamp };
      this.telemetry.append({ requestId, provider: response.provider, model: response.model, operation: response.operation, estimatedCostUsd: response.estimatedCostUsd, latencyMs, success: true, fallbackUsed: response.fallbackUsed, routeTrace: response.routeTrace, dataClassification: request.dataClassification, jurisdiction: request.jurisdiction, timestamp });
      this.audit.append({ requestId, timestamp, caller, operation: request.operation, dataClassification: request.dataClassification, routeConsidered: route.trace, routeSelected: route.adapter.id, policyDecisions: route.decisions, provider: response.provider, model: response.model, modelVersion: response.modelVersion, fallbackState: response.fallbackUsed, latency: latencyMs, cost: response.estimatedCostUsd, errorState: null, approvalState: request.requireHumanApproval ? 'required-not-implemented' : 'not_required' });
      return response;
    } catch (error) {
      const routeTrace = (error as { routeTrace?: string[] }).routeTrace ?? [];
      this.telemetry.append({ requestId, provider: 'none', model: 'none', operation: request.operation, estimatedCostUsd: 0, latencyMs: 0, success: false, fallbackUsed: false, routeTrace, dataClassification: request.dataClassification, jurisdiction: request.jurisdiction, timestamp, rejected: true });
      this.audit.append({ requestId, timestamp, caller, operation: request.operation, dataClassification: request.dataClassification, routeConsidered: routeTrace, routeSelected: null, policyDecisions: [], provider: null, model: null, fallbackState: false, latency: 0, cost: 0, errorState: 'No eligible provider route', approvalState: 'not_required' });
      throw error;
    }
  }
}
