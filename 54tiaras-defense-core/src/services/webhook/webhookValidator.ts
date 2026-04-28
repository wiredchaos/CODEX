import { ssrfGuard } from './ssrfGuard.js';
import { validateRedirectChain } from './redirectGuard.js';
import { resolveAndCheckHost } from './dnsGuard.js';

export type WebhookValidationResult = {
  verdict: 'allow' | 'block';
  score: number;
  reasons: string[];
  resolvedIps?: string[];
};

export async function validateWebhookDestination(input: {
  url: string;
  allowlistHosts?: string[];
}): Promise<WebhookValidationResult> {
  const url = new URL(input.url);

  const reasons: string[] = [];
  let riskScore = 0;
  let resolvedIps: string[] | undefined;

  // SSRF guard (includes private IP / metadata / port policy)
  const ssrf = await ssrfGuard(url, { allowlistHosts: input.allowlistHosts });
  if (!ssrf.allowed) {
    reasons.push(ssrf.reason);
    riskScore = Math.max(riskScore, ssrf.reason === 'private_ip_blocked' ? 95 : 60);
  }
  if (ssrf.allowed) resolvedIps = ssrf.resolvedIps;

  // Redirect chain validation (defensive placeholder: validate a provided chain if present)
  // In production, you would resolve redirects using a HEAD request with strict timeouts and max hops.
  const redirect = validateRedirectChain([url.toString()]);
  if (!redirect.ok) {
    reasons.push(redirect.reason);
    riskScore = Math.max(riskScore, 40);
  }

  // DNS rebind defense: resolve and ensure public IPs
  try {
    const resolved = await resolveAndCheckHost(url.hostname);
    resolvedIps = resolved.ips;
  } catch {
    reasons.push('dns_private_or_failed');
    riskScore = Math.max(riskScore, 90);
  }

  const verdict = reasons.length === 0 ? 'allow' : 'block';
  return {
    verdict,
    score: verdict === 'allow' ? 0 : Math.min(100, Math.max(1, riskScore)),
    reasons: Array.from(new Set(reasons)),
    resolvedIps,
  };
}

