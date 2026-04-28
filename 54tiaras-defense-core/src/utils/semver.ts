export type Semver = {
  major: number;
  minor: number;
  patch: number;
};

export function parseSemver(input: string): Semver | null {
  const m = input.trim().match(/^v?(\d+)\.(\d+)\.(\d+)/);
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) };
}

export function compareSemver(a: Semver, b: Semver): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

export function isPatched(current: string, minimumPatched: string): boolean {
  const c = parseSemver(current);
  const min = parseSemver(minimumPatched);
  if (!c || !min) return false;
  return compareSemver(c, min) >= 0;
}

