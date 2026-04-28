import { describe, expect, it } from 'vitest';

import { clampScore, scoreSignals } from '../src/services/risk/scoring.js';

describe('risk scoring', () => {
  it('clamps into 0-100', () => {
    expect(clampScore(-5)).toBe(0);
    expect(clampScore(0)).toBe(0);
    expect(clampScore(101)).toBe(100);
  });

  it('assigns higher score for critical signals', () => {
    const low = scoreSignals({
      exposedSecret: false,
      webhookSsrfRisk: false,
      vendorMissedSla: false,
      vulnerableGhes: false,
      featureFlagLeak: false,
      bundleSensitiveConfig: false,
      suspiciousGitPush: false,
      repoEnumeration: false,
      privateRepoAnomaly: false
    });

    const high = scoreSignals({
      exposedSecret: true,
      webhookSsrfRisk: true,
      vendorMissedSla: true,
      vulnerableGhes: true,
      featureFlagLeak: true,
      bundleSensitiveConfig: true,
      suspiciousGitPush: true,
      repoEnumeration: true,
      privateRepoAnomaly: true
    });

    expect(high.score).toBeGreaterThan(low.score);
    expect(high.score).toBeGreaterThanOrEqual(80);
  });
});

