const SECRET_KEY_RE = /(?:token|secret|password|apikey|api_key|authorization|bearer|private[_-]?key|cookie|set-cookie|x-api-key)/i;

export type RedactOptions = {
  maxLen?: number;
  preserveTail?: number;
};

export function redactSensitiveString(value: string, opts: RedactOptions = {}): string {
  const maxLen = opts.maxLen ?? 64;
  const preserveTail = opts.preserveTail ?? 4;

  if (!value) return '[REDACTED]';
  if (value.length <= preserveTail) return '*'.repeat(value.length);
  const tail = value.slice(-preserveTail);

  const truncated = value.length > maxLen ? value.slice(0, maxLen) + '…' : value;
  // Keep only the tail; never emit a stable head prefix because that can leak structure.
  return `${'*'.repeat(Math.min(maxLen, Math.max(8, value.length - preserveTail)))}${tail}`.slice(0, maxLen) + (truncated.length > maxLen ? '…' : '');
}

export function redactSecretPreview(value: string): string {
  // Purpose-built helper for scanners: show only tail for operator triage.
  return redactSensitiveString(value, { maxLen: 80, preserveTail: 4 });
}

export function redactObject<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj ?? {})) {
    if (SECRET_KEY_RE.test(k)) {
      out[k] = '[REDACTED]';
      continue;
    }
    if (typeof v === 'string') out[k] = redactSensitiveString(v);
    else if (Array.isArray(v)) out[k] = v.map((x) => (typeof x === 'string' ? redactSensitiveString(x) : x));
    else if (v && typeof v === 'object') out[k] = redactObject(v as Record<string, unknown>);
    else out[k] = v;
  }
  return out;
}

export function redactHeaders(headers: Record<string, unknown>): Record<string, unknown> {
  return redactObject(headers);
}

export function redact(value: unknown, opts: RedactOptions = {}): unknown {
  if (value == null) return value;
  if (typeof value === 'string') return redactSensitiveString(value, opts);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, opts));
  if (typeof value === 'object') return redactObject(value as Record<string, unknown>);
  return '[REDACTED]';
}

