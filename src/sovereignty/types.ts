export type Status = 'active' | 'disabled' | 'mock' | 'not_verified' | 'development_only' | 'quarantined';
export type Capability = 'chat' | 'embedding' | 'tool_plan' | 'deterministic_fallback';
export type Operation = 'inference' | 'evaluation' | 'stress_test';
export type DataClassification = 'public' | 'internal' | 'restricted';
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN' | 'DISABLED' | 'QUARANTINED';
export type Permission = 'allowed' | 'prohibited' | 'unknown' | 'not_verified';
export type UnknownMetric = number | 'unknown' | 'not_verified';

export interface RightsRecord {
  id: string;
  status: Status;
  licenseStatus: 'allowed' | 'prohibited' | 'unknown' | 'not_verified';
  commercialUse: Permission;
  redistribution: Permission;
  modification: Permission;
  prohibitedJurisdictions: string[];
  reviewDate: string;
  evidenceUrl: string;
  notes: string;
}

export interface ProviderRecord {
  id: string;
  status: Status;
  type: 'local' | 'private' | 'cloud' | 'deterministic';
  approvedForRestricted: boolean;
  jurisdictionId: string;
  health: 'healthy' | 'degraded' | 'unhealthy' | 'disabled' | 'quarantined';
  endpointUrl: string;
  notes: string;
}

export interface ModelRecord {
  id: string;
  status: Status;
  providerId: string;
  rightsId: string;
  hardwareId?: string;
  capabilities: Capability[];
  operations: Operation[];
  costUsd: UnknownMetric;
  latencyMs: UnknownMetric;
  notes: string;
}

export interface HardwareRecord {
  id: string;
  status: Status;
  providerId: string;
  throughput: UnknownMetric;
  notes: string;
}

export interface JurisdictionRecord {
  id: string;
  status: Status;
  countryCode: string;
  restrictedDataAllowed: boolean;
  notes: string;
}

export interface Registries {
  models: ModelRecord[];
  providers: ProviderRecord[];
  hardware: HardwareRecord[];
  rights: RightsRecord[];
  jurisdictions: JurisdictionRecord[];
}

export interface RouteRequest {
  operation: Operation;
  capability: Capability;
  dataClassification: DataClassification;
  commercial?: boolean;
  jurisdictionId: string;
  preferredProviderId?: string;
  maxCostUsd?: number;
  maxLatencyMs?: number;
  requireRedistribution?: boolean;
  requireModification?: boolean;
  stressTest?: boolean;
}

export interface RouteTrace {
  candidateId: string;
  providerId?: string;
  accepted: boolean;
  reasons: string[];
}

export interface RouteResult {
  allowed: boolean;
  modelId?: string;
  providerId?: string;
  trace: RouteTrace[];
  denialReasons: string[];
  fallbackUsed: boolean;
}
