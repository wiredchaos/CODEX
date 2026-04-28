import { resolveHostname, isPrivateIp } from '../../utils/net.js';

export async function resolveAndCheckHost(hostname: string): Promise<{ ips: string[] }> {
  const { addresses } = await resolveHostname(hostname);
  if (addresses.length === 0) {
    throw new Error('dns_resolution_failed');
  }
  const bad = addresses.find((ip) => isPrivateIp(ip));
  if (bad) {
    throw new Error('dns_private_or_loopback');
  }
  return { ips: addresses };
}

export async function validateHostResolvesPublic(
  url: URL,
  _input: { allowlistHosts?: string[] }
): Promise<{ ok: true; resolvedIps: string[] } | { ok: false; reasons: string[]; riskScore: number; resolvedIps?: string[] }> {
  const { addresses } = await resolveHostname(url.hostname);
  if (addresses.length === 0) {
    return { ok: false, reasons: ['dns_resolution_failed'], riskScore: 40 };
  }
  const bad = addresses.find((ip) => isPrivateIp(ip));
  if (bad) {
    return { ok: false, reasons: ['dns_private_or_loopback'], riskScore: 90, resolvedIps: addresses };
  }
  return { ok: true, resolvedIps: addresses };
}

