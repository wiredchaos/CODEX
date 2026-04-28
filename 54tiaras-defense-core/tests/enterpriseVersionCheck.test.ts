import { describe, expect, it } from 'vitest';
import { classifyGhesVersion, isVulnerableGhes } from '../src/services/github/enterpriseVersionCheck.js';

describe('enterpriseVersionCheck', () => {
  it('classifies versions and vulnerability status deterministically', () => {
    expect(classifyGhesVersion('3.11.0')).toBe('supported');
    expect(classifyGhesVersion('')).toBe('unknown');
    expect(classifyGhesVersion('not-a-version')).toBe('unknown');
  });

  it('flags end-of-life versions as vulnerable', () => {
    expect(isVulnerableGhes('2.22.0')).toBe(true);
    expect(isVulnerableGhes('3.11.10')).toBe(false);
  });
});

