export const operations=['generate','reason','embed','rerank','transcribe','synthesize','vision','moderate','code','toolPlan'] as const;
export type GatewayOperation=typeof operations[number];
export type DataClassification='public'|'internal'|'confidential'|'restricted';
export type GatewayRequest={operation:GatewayOperation;input:unknown;preferredProvider?:string;preferredModel?:string;requiredCapabilities?:string[];dataClassification?:DataClassification;jurisdiction?:string;maxCostUsd?:number;maxLatencyMs?:number;allowCloud?:boolean;allowLocal?:boolean;allowFallback?:boolean;requireHumanApproval?:boolean;metadata?:Record<string,unknown>};
export type GatewayResponse={requestId:string;provider:string;model:string;operation:string;output:unknown;latencyMs:number;estimatedCostUsd:number;fallbackUsed:boolean;routeTrace:string[];policyDecisions:string[];modelVersion?:string;timestamp:string};
export type ProviderHealth={healthy:boolean;latencyMs:number;message?:string};
export type ProviderResult={model:string;modelVersion?:string;output:unknown;estimatedCostUsd:number;latencyMs:number};
export interface ModelProviderAdapter{id:string;supportedOperations:string[];healthCheck():Promise<ProviderHealth>;estimateCost(request:GatewayRequest):Promise<number>;execute(request:GatewayRequest):Promise<ProviderResult>}
export type CircuitState='CLOSED'|'OPEN'|'HALF_OPEN'|'DISABLED'|'QUARANTINED';
export type ModelRecord={id:string;provider:string;version:string;operations:string[];capabilities:string[];context_window:number|string;input_modalities:string[];output_modalities:string[];languages:string[];latency_class:string;cost_class:string;reliability_score:number;evaluation_score:number;hardware_requirements:string[];deployment_modes:string[];jurisdictions:string[];status:string};
export type ProviderRecord={id:string;name:string;deploymentMode:'cloud'|'local'|'edge'|'deterministic';jurisdictions:string[];approvedFor:string[];retention:string;status:string};
export type RightsRecord={model_id:string;source_url:string;license_name:string;license_url:string;commercial_use:boolean|'unknown';modification_allowed:boolean|'unknown';redistribution_allowed:boolean|'unknown';distillation_allowed:boolean|'unknown';attribution_required:boolean|'unknown';restricted_industries:string[];restricted_jurisdictions:string[];termination_conditions:string;review_date:string;notes:string};
export type EvaluationResult={testId:string;modelId:string;passed:boolean;score:number;latencyMs:number;estimatedCostUsd:number;violations:string[];notes:string[];timestamp:string};
