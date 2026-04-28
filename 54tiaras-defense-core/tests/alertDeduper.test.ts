import { describe, expect, it } from 'vitest';
import { dedupeKey } from '../src/services/alerts/alertDeduper.js';

describe('alertDeduper', () => {
  it('is stable for the same input', () => {
    const a = dedupeKey({ orgId: 'o1', category: 'secret', fingerprint: 'fp1' });
    const b = dedupeKey({ orgId: 'o1', category: 'secret', fingerprint: 'fp1' });
    expect(a).toEqual(b);
  });

  it('changes if fingerprint changes', () => {
    const a = dedupeKey({ orgId: 'o1', category: 'secret', fingerprint: 'fp1' });
    const b = dedupeKey({ orgId: 'o1', category: 'secret', fingerprint: 'fp2' });
    expect(a).not.toEqual(b);
  });
});

