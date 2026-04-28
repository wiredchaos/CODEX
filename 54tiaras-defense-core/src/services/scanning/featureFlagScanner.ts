import { z } from 'zod';
import { sha256Hex } from '../../utils/crypto.js';
import { redactSensitiveString } from '../../utils/redact.js';
import { makeFingerprint } from './secretScanner.js';

export type FeatureFlagFinding = {
  kind:
    | 'secret'
    | 'api_token'
    | 'auth_weakness'
    | 'internal_endpoint'
    | 'customer_pii'
    | 'employee_identifier'
    | 'exploit_note';
  message: string;
  fingerprint: string;
  preview: string;
  reasons: string[];
  path?: string;
  flagKey?: string;
};

export type FeatureFlagScanResult = {
  findings: FeatureFlagFinding[];
  reasons: string[];
};

// Work around a TS inference edge in strict NodeNext builds:
// zod regex enum overload can be mis-selected in some module settings.
const _zodRegex: typeof z.regex = z.regex;

const EMAIL_RE =
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;

const INTERNAL_ENDPOINT_RE =
  /\b(?:localhost|127\.0\.0\.1|0\.0\.0\.0|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})\b/gi;

const AUTH_WEAKNESS_RE =
  /\b(?:bypass|disable[_-]?auth|noauth|skip[_-]?auth|hardcoded[_-]?admin|superuser|godmode|admin[_-]?token)\b/gi;

const TOKEN_HINT_RE =
  /\b(?:api[_-]?key|token|secret|bearer|authorization)\b/gi;

const EMPLOYEE_HINT_RE =
  /\b(?:employee|staff|internal user|corp|work email)\b/gi;

const EXPLOIT_NOTE_RE =
  /\b(?:exploit|payload|rce|ssrf|sqli|xss|lfi|pwn|weaponize|dropper)\b/gi;

// Defensive, non-weaponized pattern matching for common production tokens.
// We do not validate or use the token - we only detect and fingerprint.
const SECRET_LIKE_TOKEN_RE =
  /\b(?:sk_(?:live|test)_[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16})\b/g;

export const FeatureFlagScanInputSchema = z.object({
  // Support common shapes: {flags:{key:value}} or array entries.
  flags: z
    .union([
      z.record(z.string(), z.unknown()),
      z.array(
        z.object({
          key: z.string(),
          value: z.unknown(),
          path: z.string().optional(),
        })
      ),
    ])
    .optional(),
  raw: z.string().optional(),
  source: z.string().optional(),
});

function normalizeToEntries(input: z.infer<typeof FeatureFlagScanInputSchema>) {
  const entries: Array<{ key?: string; value: string; path?: string }> = [];
  if (typeof input.raw === 'string') {
    entries.push({ value: input.raw, path: input.source });
  }
  if (Array.isArray(input.flags)) {
    for (const e of input.flags) {
      entries.push({ key: e.key, value: JSON.stringify(e.value), path: e.path });
    }
  } else if (input.flags && typeof input.flags === 'object') {
    for (const [k, v] of Object.entries(input.flags)) {
      entries.push({ key: k, value: typeof v === 'string' ? v : JSON.stringify(v) });
    }
  }
  return entries;
}

function finding(
  kind: FeatureFlagFinding['kind'],
  value: string,
  msg: string,
  reasons: string[],
  meta?: { path?: string; key?: string }
) {
  const fp = makeFingerprint(`${kind}:${value}`);
  return {
    kind,
    message: msg,
    fingerprint: fp,
    preview: redactSensitiveString(value),
    reasons,
    path: meta?.path,
    flagKey: meta?.key,
  } satisfies FeatureFlagFinding;
}

export function scanFeatureFlags(input: z.infer<typeof FeatureFlagScanInputSchema>): FeatureFlagScanResult {
  const entries = normalizeToEntries(input);
  const out: FeatureFlagFinding[] = [];
  const reasons: string[] = [];

  for (const e of entries) {
    const v = e.value ?? '';
    if (!v) continue;

    // Secret-like tokens (e.g. Stripe keys) - highest priority.
    if (SECRET_LIKE_TOKEN_RE.test(v)) {
      const token = (v.match(SECRET_LIKE_TOKEN_RE) ?? [])[0] ?? v;
      out.push(
        finding(
          'secret',
          token,
          'Secret-like token detected in feature flag payload (fingerprinted; value redacted).',
          ['secret-like-token'],
          { path: e.path, key: e.key }
        )
      );
      reasons.push('secret-like-token');
    }

    // PII
    if (EMAIL_RE.test(v)) {
      const email = (v.match(EMAIL_RE) ?? [])[0] ?? v;
      out.push(
        finding('customer_pii', email, 'Email address detected in feature flag payload.', ['pii-email'], {
          path: e.path,
          key: e.key,
        })
      );
      reasons.push('pii-email');
    }

    // Internal endpoints
    if (INTERNAL_ENDPOINT_RE.test(v)) {
      const endpoint = (v.match(INTERNAL_ENDPOINT_RE) ?? [])[0] ?? v;
      out.push(
        finding('internal_endpoint', endpoint, 'Internal/private network endpoint detected in feature flag payload.', ['internal-endpoint'], {
          path: e.path,
          key: e.key,
        })
      );
      reasons.push('internal-endpoint');
    }

    // Auth weakness labels
    if (AUTH_WEAKNESS_RE.test(v)) {
      const token = (v.match(AUTH_WEAKNESS_RE) ?? [])[0] ?? v;
      out.push(
        finding('auth_weakness', token, 'Auth-weakness marker detected in feature flag payload.', ['auth-weakness-label'], {
          path: e.path,
          key: e.key,
        })
      );
      reasons.push('auth-weakness-label');
    }

    // “Exploit notes” and disallowed content. We only flag; we do not generate or store payloads.
    if (EXPLOIT_NOTE_RE.test(v)) {
      const term = (v.match(EXPLOIT_NOTE_RE) ?? [])[0] ?? v;
      out.push(
        finding('exploit_note', term, 'Exploit-related term detected in feature flag payload.', ['exploit-note'], {
          path: e.path,
          key: e.key,
        })
      );
      reasons.push('exploit-note');
    }

    // Secret-y content: reuse secret fingerprinting heuristics by hashing the value.
    // This does NOT prove it is a secret, but it creates a stable fingerprint for dedupe.
    if (TOKEN_HINT_RE.test(v)) {
      out.push(
        finding(
          'api_token',
          sha256Hex(v),
          'Token/secret hint detected in feature flag payload (fingerprinted by SHA-256 of content).',
          ['secret-like-token'],
          { path: e.path, key: e.key }
        )
      );
      reasons.push('secret-like-token');
    }

    if (EMPLOYEE_HINT_RE.test(v)) {
      out.push(
        finding(
          'employee_identifier',
          sha256Hex(v),
          'Employee/internal identifier hint detected in feature flag payload (fingerprinted by SHA-256 of content).',
          ['employee-identifier-hint'],
          { path: e.path, key: e.key }
        )
      );
      reasons.push('employee-identifier-hint');
    }
  }

  // Deduplicate by fingerprint.
  const seen = new Set<string>();
  const findings = out.filter((x) => {
    if (seen.has(x.fingerprint)) return false;
    seen.add(x.fingerprint);
    return true;
  });

  return {
    findings,
    reasons: Array.from(new Set(reasons)),
  };
}

