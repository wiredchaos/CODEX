import { describe, expect, it } from 'vitest';
import { fingerprintSecret, redactSecret } from '../src/services/scanning/secretScanner.js';

describe('Secret scanner primitives', () => {
  it('fingerprints without revealing raw secret', () => {
    const fp = fingerprintSecret('super-secret-token-value');
    expect(fp).toMatch(/^[a-f0-9]{64}$/);
  });

  it('redacts preserving last 4 chars', () => {
    expect(redactSecret('abcd-efgh-ijkl')).toBe('***********ijkl');
    expect(redactSecret('1234')).toBe('****');
  });
});

