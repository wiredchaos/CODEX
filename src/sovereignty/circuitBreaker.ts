import { readFileSync, writeFileSync } from 'node:fs';
import type { CircuitState } from './types.js';
export class CircuitBreaker { failures = 0; state: CircuitState = 'CLOSED'; openedAt = 0; constructor(public id: string, private threshold = 3, private cooldownMs = 1000) {}
  canRoute(now = Date.now()): boolean { if (this.state === 'DISABLED' || this.state === 'QUARANTINED') return false; if (this.state === 'OPEN' && now - this.openedAt >= this.cooldownMs) this.state = 'HALF_OPEN'; return this.state !== 'OPEN'; }
  recordSuccess(): void { if (this.state === 'HALF_OPEN') this.state = 'CLOSED'; this.failures = 0; }
  recordFailure(now = Date.now()): void { if (this.state === 'HALF_OPEN' || ++this.failures >= this.threshold) { this.state = 'OPEN'; this.openedAt = now; } }
  disable(): void { this.state = 'DISABLED'; } quarantine(): void { this.state = 'QUARANTINED'; } reset(): void { this.state = 'CLOSED'; this.failures = 0; this.openedAt = 0; }
  save(file: string): void { writeFileSync(file, JSON.stringify({ id:this.id, failures:this.failures, state:this.state, openedAt:this.openedAt })); }
  static load(file: string): CircuitBreaker { try { const data = JSON.parse(readFileSync(file, 'utf8')); const cb = new CircuitBreaker(String(data.id)); if (!['CLOSED','OPEN','HALF_OPEN','DISABLED','QUARANTINED'].includes(data.state)) throw new Error('bad state'); cb.state = data.state; cb.failures = Number(data.failures) || 0; cb.openedAt = Number(data.openedAt) || 0; return cb; } catch { const cb = new CircuitBreaker('corrupt'); cb.state = 'OPEN'; return cb; } }
}
