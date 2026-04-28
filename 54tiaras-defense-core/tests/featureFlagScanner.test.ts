import { describe, expect, it } from 'vitest';
import { scanFeatureFlags } from '../src/services/scanning/featureFlagScanner.js';

describe('featureFlagScanner', () => {
  it('detects secrets and pii', () => {
    const res = scanFeatureFlags({
      flags: [
        { key: 'enable-new-flow', value: 'true' },
        { key: 'internal_api', value: 'https://internal.service.local' },
        { key: 'leak', value: 'sk_live_1234567890abcdef' },
        { key: 'pii', value: 'email=alice@example.com' }
      ]
    });
    const reasons = res.findings.flatMap((f) => f.reasons);
    expect(reasons).toContain('secret-like-token');
    expect(reasons).toContain('pii-email');
  });
});

