import { z } from 'zod';

export const RiskSignalSchema = z.object({
  code: z.string().min(1),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  weight: z.number().int().min(0).max(100),
});

export type RiskSignal = z.infer<typeof RiskSignalSchema>;

export type RiskInput = {
  signals: RiskSignal[];
};

const severityBoost: Record<RiskSignal['severity'], number> = {
  LOW: 0,
  MEDIUM: 5,
  HIGH: 12,
  CRITICAL: 22,
};

/**
 * Score in range 0..100.
 * Defensive by design: saturating model where critical signals dominate.
 */
export function scoreRisk(input: RiskInput): { score: number; drivers: RiskSignal[] } {
  const signals = input.signals.map((s) => RiskSignalSchema.parse(s));

  // Sort for deterministic top drivers
  const sorted = [...signals].sort((a, b) => {
    const sev = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
    const sa = sev.indexOf(a.severity);
    const sb = sev.indexOf(b.severity);
    if (sa !== sb) return sb - sa;
    return b.weight - a.weight;
  });

  // Saturating sum with severity boosts.
  let raw = 0;
  for (const s of sorted) {
    raw += Math.min(100, s.weight + severityBoost[s.severity]);
  }

  // Diminishing returns: first signals matter most.
  const diminishing = Math.min(100, Math.round(100 * (1 - Math.exp(-raw / 120))));
  return { score: diminishing, drivers: sorted.slice(0, 8) };
}

// Compatibility helpers expected by unit tests and higher-level routes.
export function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export type CriticalSignals = {
  exposedSecret: boolean;
  vulnerableGhes: boolean;
  bundleSensitiveConfig: boolean;
  featureFlagLeak: boolean;
  webhookSsrfRisk: boolean;
  vendorMissedSla: boolean;
  suspiciousGitPush: boolean;
  repoEnumeration: boolean;
  privateRepoAnomaly: boolean;
};

export function scoreSignals(signals: CriticalSignals): { score: number; severity: RiskSignal['severity']; drivers: RiskSignal[] } {
  const mapped: RiskSignal[] = [];
  const add = (code: string, severity: RiskSignal['severity'], weight: number, on: boolean) => {
    if (!on) return;
    mapped.push({ code, severity, weight });
  };

  add('exposed_secret', 'CRITICAL', 95, signals.exposedSecret);
  add('vulnerable_ghes', 'HIGH', 70, signals.vulnerableGhes);
  add('bundle_sensitive_config', 'HIGH', 65, signals.bundleSensitiveConfig);
  add('feature_flag_leak', 'HIGH', 60, signals.featureFlagLeak);
  add('webhook_ssrf_risk', 'HIGH', 75, signals.webhookSsrfRisk);
  add('vendor_missed_sla', 'MEDIUM', 45, signals.vendorMissedSla);
  add('suspicious_git_push', 'MEDIUM', 40, signals.suspiciousGitPush);
  add('repo_enumeration', 'MEDIUM', 35, signals.repoEnumeration);
  add('private_repo_anomaly', 'HIGH', 55, signals.privateRepoAnomaly);

  const result = scoreRisk({ signals: mapped });
  const severity: RiskSignal['severity'] =
    result.score >= 85 ? 'CRITICAL' : result.score >= 70 ? 'HIGH' : result.score >= 40 ? 'MEDIUM' : 'LOW';

  return { score: clampScore(result.score), severity, drivers: result.drivers };
}

export function computeRiskScoreFromSignals(signals: RiskSignal[]): { score: number; severity: RiskSignal['severity']; drivers: RiskSignal[] } {
  const result = scoreRisk({ signals });
  const severity: RiskSignal['severity'] =
    result.score >= 85 ? 'CRITICAL' : result.score >= 70 ? 'HIGH' : result.score >= 40 ? 'MEDIUM' : 'LOW';
  return { score: clampScore(result.score), severity, drivers: result.drivers };
}

