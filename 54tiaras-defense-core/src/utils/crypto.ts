import crypto from 'node:crypto';

export function sha256Hex(input: string | Buffer): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function hmacSha256Hex(secret: string, input: string | Buffer): string {
  return crypto.createHmac('sha256', secret).update(input).digest('hex');
}

export function timingSafeEqualHex(a: string, b: string): boolean {
  try {
    const aa = Buffer.from(a, 'hex');
    const bb = Buffer.from(b, 'hex');
    if (aa.length !== bb.length) return false;
    return crypto.timingSafeEqual(aa, bb);
  } catch {
    return false;
  }
}

