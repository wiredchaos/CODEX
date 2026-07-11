import { appendFileSync, chmodSync, existsSync, mkdirSync, openSync, closeSync } from 'node:fs';
import { dirname } from 'node:path';
import crypto from 'node:crypto';

const SECRET_PATTERNS = [/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, /(admin[_-]?token|api[_-]?key|secret)(["'\s:=]+)[^"'\s,}]+/gi];
export type AuditEvent = { type: string; action: string; actor?: string; requestId?: string; details?: Record<string, unknown>; timestamp?: string; hash?: string };
export interface AuditSink { write(event: AuditEvent): void; }
export interface ProductionAuditPersistencePlaceholder { postgresql?: 'not_implemented'; objectStorage?: 'not_implemented'; signedReceipts?: 'not_implemented'; wormStorage?: 'not_implemented'; externalAuditSystems?: 'not_implemented'; }
export const productionAuditPersistence: ProductionAuditPersistencePlaceholder = { postgresql:'not_implemented', objectStorage:'not_implemented', signedReceipts:'not_implemented', wormStorage:'not_implemented', externalAuditSystems:'not_implemented' };
export function sanitize(value: unknown): unknown { const s = JSON.stringify(value ?? {}); return JSON.parse(SECRET_PATTERNS.reduce((acc, re) => acc.replace(re, (m, p1, p2) => p2 ? `${p1}${p2}[REDACTED]` : 'Bearer [REDACTED]'), s)); }
export class LocalJsonlAuditSink implements AuditSink {
  warned = false;
  constructor(private file: string) { mkdirSync(dirname(file), { recursive: true }); if (!existsSync(file)) { const fd = openSync(file, 'a', 0o600); closeSync(fd); } chmodSync(file, 0o600); }
  write(event: AuditEvent): void { if (!this.warned) { console.warn('SOVEREIGNTY AUDIT WARNING: local JSONL is local development audit output only; not immutable, signed, multi-process safe, multi-node safe, compliance-grade, or durable on ephemeral filesystems.'); this.warned = true; }
    const clean = sanitize({ ...event, timestamp: event.timestamp ?? new Date().toISOString() }) as AuditEvent; const hash = crypto.createHash('sha256').update(JSON.stringify(clean)).digest('hex'); appendFileSync(this.file, `${JSON.stringify({ ...clean, hash })}\n`, { mode: 0o600 }); }
}
export class MemoryAuditSink implements AuditSink { events: AuditEvent[] = []; write(event: AuditEvent): void { this.events.push(sanitize({ ...event, timestamp: event.timestamp ?? new Date().toISOString() }) as AuditEvent); } }
