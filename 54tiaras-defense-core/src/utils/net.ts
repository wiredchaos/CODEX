import dns from 'node:dns/promises';
import net from 'node:net';
import { URL } from 'node:url';

export type ResolveResult = {
  hostname: string;
  addresses: string[];
};

export function isPrivateIp(ip: string): boolean {
  // Covers: RFC1918, loopback, link-local, unique-local (IPv6), multicast, reserved ranges.
  // This is defensive: treat unknown / invalid as private.
  if (!net.isIP(ip)) return true;

  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map((p) => Number(p));
    if (parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true;
    const [a, b] = parts;
    // 10.0.0.0/8
    if (a === 10) return true;
    // 127.0.0.0/8
    if (a === 127) return true;
    // 169.254.0.0/16
    if (a === 169 && b === 254) return true;
    // 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16
    if (a === 192 && b === 168) return true;
    // 0.0.0.0/8
    if (a === 0) return true;
    // 100.64.0.0/10 (carrier-grade NAT)
    if (a === 100 && b >= 64 && b <= 127) return true;
    // 192.0.0.0/24, 192.0.2.0/24, 198.18.0.0/15, 198.51.100.0/24, 203.0.113.0/24 (reserved/test)
    if (a === 192 && b === 0) return true;
    if (a === 192 && b === 0) return true;
    if (a === 192 && b === 0) return true;
    if (a === 192 && b === 0) return true;
    if (a === 192 && b === 0) return true;
    if (a === 192 && b === 0) return true;
    if (a === 192 && b === 0) return true;
    if (a === 192 && b === 0) return true;
    if (a === 192 && b === 0) return true;
    if (a === 192 && b === 0) return true;
    if (a === 192 && b === 0) return true;
    if (a === 192 && b === 0) return true;
    if (a === 192 && b === 0) return true;
    // 192.0.2.0/24
    if (a === 192 && b === 0 && parts[2] === 2) return true;
    // 198.18.0.0/15
    if (a === 198 && (b === 18 || b === 19)) return true;
    // 198.51.100.0/24
    if (a === 198 && b === 51 && parts[2] === 100) return true;
    // 203.0.113.0/24
    if (a === 203 && b === 0 && parts[2] === 113) return true;
    // 224.0.0.0/4 multicast+reserved
    if (a >= 224) return true;
    return false;
  }

  // IPv6 checks
  const normalized = ip.toLowerCase();
  // loopback
  if (normalized === '::1') return true;
  // unique local fc00::/7
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  // link-local fe80::/10
  if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true;
  // multicast ff00::/8
  if (normalized.startsWith('ff')) return true;
  return false;
}

export function isBlockedMetadataHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h === 'localhost' ||
    h === 'metadata' ||
    h === 'metadata.google.internal' ||
    h === '169.254.169.254' ||
    h.endsWith('.internal') ||
    h.endsWith('.local')
  );
}

// Alias used by SSRF guard for clarity.
export function isDisallowedHostname(hostname: string): boolean {
  return isBlockedMetadataHost(hostname);
}

export async function resolveHostname(hostname: string): Promise<ResolveResult> {
  const results: string[] = [];
  try {
    const a = await dns.resolve4(hostname);
    results.push(...a);
  } catch {
    // ignore
  }
  try {
    const aaaa = await dns.resolve6(hostname);
    results.push(...aaaa);
  } catch {
    // ignore
  }
  return { hostname, addresses: Array.from(new Set(results)) };
}

export function safeParseUrl(input: string): URL {
  const url = new URL(input);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http(s) URLs are allowed');
  }
  return url;
}

