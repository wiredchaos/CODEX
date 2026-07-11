import type { GatewayRequest, ModelRecord, ProviderRecord, RightsRecord } from './types';

export type PolicyResult = { allowed: boolean; decisions: string[] };

export function evaluatePolicy(req: GatewayRequest, provider: ProviderRecord, model: ModelRecord, rights?: RightsRecord): PolicyResult {
  const decisions: string[] = [];
  const cls = req.dataClassification ?? 'internal';
  if (req.allowCloud === false && provider.deploymentMode === 'cloud') return { allowed: false, decisions: ['cloud blocked by request'] };
  if (req.allowLocal === false && provider.deploymentMode !== 'cloud') return { allowed: false, decisions: ['local/edge blocked by request'] };
  if (cls === 'restricted' && provider.deploymentMode === 'cloud') return { allowed: false, decisions: ['restricted data must remain local unless override exists'] };
  if (cls === 'confidential' && provider.deploymentMode === 'cloud') decisions.push('confidential data using cloud is discouraged; lower priority');
  if (req.jurisdiction && !model.jurisdictions.includes(req.jurisdiction) && !model.jurisdictions.includes('global')) {
    return { allowed: false, decisions: [`model not available in jurisdiction ${req.jurisdiction}`] };
  }
  if (rights?.restricted_jurisdictions.includes(req.jurisdiction ?? '')) return { allowed: false, decisions: ['rights registry restricts requested jurisdiction'] };
  if (provider.status !== 'active' || model.status !== 'active') return { allowed: false, decisions: ['provider or model inactive'] };
  return { allowed: true, decisions: [...decisions, `policy allowed ${cls} on ${provider.id}`] };
}
