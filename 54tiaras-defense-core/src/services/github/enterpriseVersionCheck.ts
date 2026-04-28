import { z } from 'zod';

import { parseSemver, compareSemver } from '../../utils/semver.js';

export const EnterpriseVersionInputSchema = z.object({
  currentVersion: z.string().min(1),
  minimumSafeVersion: z.string().min(1),
});

export type EnterpriseVersionInput = z.infer<typeof EnterpriseVersionInputSchema>;

export function checkEnterpriseVersion(input: EnterpriseVersionInput) {
  const parsed = EnterpriseVersionInputSchema.parse(input);
  const cur = parseSemver(parsed.currentVersion);
  const min = parseSemver(parsed.minimumSafeVersion);
  if (!cur || !min) {
    return {
      currentVersion: parsed.currentVersion,
      minimumSafeVersion: parsed.minimumSafeVersion,
      isVulnerable: true,
    };
  }
  const cmp = compareSemver(cur, min);
  const isVulnerable = cmp < 0;
  return {
    currentVersion: parsed.currentVersion,
    minimumSafeVersion: parsed.minimumSafeVersion,
    isVulnerable,
  };
}

export type GhesLifecycle = 'supported' | 'eol' | 'unknown';

// Conservative lifecycle classifier: only uses major.minor.
export function classifyGhesVersion(version: string): GhesLifecycle {
  const parsed = parseSemver(version);
  if (!parsed) return 'unknown';

  // Policy: treat versions below 3.11 as EOL (defensive default).
  // This is intentionally conservative and should be updated from a canonical lifecycle feed.
  if (parsed.major < 3) return 'eol';
  if (parsed.major === 3 && parsed.minor < 11) return 'eol';
  return 'supported';
}

export function isVulnerableGhes(version: string): boolean {
  const lifecycle = classifyGhesVersion(version);
  if (lifecycle === 'unknown') return true;
  if (lifecycle === 'eol') return true;

  // Minimum patched baseline for the "supported" line in this scaffold.
  // Adjust via config/CVE feed in production.
  const minPatched = parseSemver('3.11.10');
  const cur = parseSemver(version);
  if (!minPatched || !cur) return true;
  return compareSemver(cur, minPatched) < 0;
}

