import { createHash } from "node:crypto";
import { toCanonicalJson } from "./canonicalJson.js";

/**
 * SHA-256 hex digest of canonical JSON.
 */
export function sha256(data: string): string {
  return createHash("sha256").update(data, "utf-8").digest("hex");
}

/**
 * payload_hash = sha256(canonical(payload))
 */
export function computePayloadHash(payload: Record<string, unknown>): string {
  return sha256(toCanonicalJson(payload));
}

/**
 * envelope_hash = sha256(canonical(envelope excluding hashes and anchor fields))
 *
 * Excluded fields: payload_hash, envelope_hash, prev_envelope_hash,
 *                  prev_global_envelope_hash, global_seq, created_at
 */
export function computeEnvelopeHash(envelope: Record<string, unknown>): string {
  const excluded = new Set([
    "payload_hash",
    "envelope_hash",
    "prev_envelope_hash",
    "prev_global_envelope_hash",
    "global_seq",
    "created_at",
  ]);

  const hashable: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(envelope)) {
    if (!excluded.has(key)) {
      hashable[key] = value;
    }
  }

  return sha256(toCanonicalJson(hashable));
}
