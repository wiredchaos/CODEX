import { URL } from 'node:url';

export function validateRedirectChain(urls: string[], maxHops = 5) {
  if (urls.length > maxHops) {
    return { ok: false as const, reason: 'too_many_redirects' as const };
  }
  for (const u of urls) {
    try {
      const parsed = new URL(u);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return { ok: false as const, reason: 'invalid_scheme' as const };
      }
    } catch {
      return { ok: false as const, reason: 'invalid_url' as const };
    }
  }
  return { ok: true as const };
}

export async function validateNoOpenRedirect(_url: URL, _opts?: { maxHops?: number }) {
  // Defensive stub: in a production implementation, perform a HEAD request with redirects disabled
  // and validate the Location chain against allowlist + public resolution checks.
  return { ok: true as const, reasons: [] as string[], riskScore: 0 };
}

