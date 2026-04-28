import dns from 'node:dns/promises';
import net from 'node:net';
import { isPrivateIp, isDisallowedHostname } from '../../utils/net.js';

export type SsrfVerdict =
  | { allowed: true; resolvedIps: string[] }
  | { allowed: false; reason: string; resolvedIps?: string[] };

const DISALLOWED_PORTS = new Set([0, 1, 7, 9, 11, 13, 15, 17, 19, 20, 21, 22, 23, 25, 53, 110, 111, 135, 137, 138, 139, 143, 389, 445, 465, 587, 631, 2049, 2375, 3306, 5432, 6379, 8080, 9200, 9300]);

export async function ssrfGuard(url: URL, opts?: { allowlistHosts?: string[] }): Promise<SsrfVerdict> {
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { allowed: false, reason: 'unsupported_protocol' };
  }

  if (!url.hostname) {
    return { allowed: false, reason: 'missing_hostname' };
  }

  const hostname = url.hostname.toLowerCase();
  if (isDisallowedHostname(hostname)) {
    return { allowed: false, reason: 'disallowed_hostname' };
  }

  const port = url.port ? Number(url.port) : url.protocol === 'https:' ? 443 : 80;
  if (!Number.isFinite(port) || port <= 0 || port > 65535) {
    return { allowed: false, reason: 'invalid_port' };
  }
  if (DISALLOWED_PORTS.has(port)) {
    // Defensive default: block common admin/infra ports. Allowlist can override at higher layer.
    return { allowed: false, reason: 'blocked_port' };
  }

  if (opts?.allowlistHosts?.length) {
    const ok = opts.allowlistHosts.map((h) => h.toLowerCase()).includes(hostname);
    if (!ok) return { allowed: false, reason: 'hostname_not_allowlisted' };
  }

  // Resolve A + AAAA and block any private or loopback ranges.
  const resolved: string[] = [];
  try {
    const a = await dns.resolve4(hostname);
    resolved.push(...a);
  } catch {
    // ignore
  }
  try {
    const aaaa = await dns.resolve6(hostname);
    resolved.push(...aaaa);
  } catch {
    // ignore
  }

  // Also treat a raw IP hostname as "resolved" without DNS.
  if (net.isIP(hostname)) {
    resolved.push(hostname);
  }

  if (resolved.length === 0) {
    // If we can't resolve, treat as unsafe to avoid DNS-rebind / delayed resolution surprises.
    return { allowed: false, reason: 'dns_resolution_failed' };
  }

  const bad = resolved.find((ip) => (net.isIP(ip) ? isPrivateIp(ip) : true));
  if (bad) return { allowed: false, reason: 'private_ip_blocked', resolvedIps: resolved };

  return { allowed: true, resolvedIps: resolved };
}

export async function assessDestinationUrl(
  input: string,
  opts?: { allowlistHosts?: string[] }
): Promise<{ allowed: boolean; reasons: string[]; resolvedIps?: string[] }> {
  const url = new URL(input);
  const verdict = await ssrfGuard(url, opts);
  if (verdict.allowed) return { allowed: true, reasons: [], resolvedIps: verdict.resolvedIps };
  const reasons: string[] = [];
  if (verdict.reason === 'private_ip_blocked') {
    reasons.push('private_or_loopback');
    if ((verdict.resolvedIps ?? []).some((ip) => ip.startsWith('127.') || ip === '::1')) reasons.push('loopback');
    if ((verdict.resolvedIps ?? []).some((ip) => ip === '169.254.169.254')) reasons.push('metadata');
  } else if (verdict.reason === 'disallowed_hostname') {
    reasons.push('metadata');
  } else if (verdict.reason === 'blocked_port') {
    // Report blocked ports, but also classify obvious private/loopback hosts so callers can
    // explain the highest-risk reason without needing DNS resolution.
    reasons.push('blocked_port');
    const host = url.hostname.toLowerCase();
    if (net.isIP(host) && isPrivateIp(host)) {
      reasons.push('private_or_loopback');
      if (host.startsWith('127.') || host === '::1') reasons.push('loopback');
      if (host === '169.254.169.254') reasons.push('metadata');
    }
  } else {
    reasons.push(verdict.reason);
  }
  return { allowed: false, reasons, resolvedIps: verdict.resolvedIps };
}

