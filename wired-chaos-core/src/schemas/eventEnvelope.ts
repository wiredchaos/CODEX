import { z } from "zod";

// ── Payload validation ─────────────────────────────────────────────

/**
 * Deep-check a value for forbidden types:
 *  - NaN / Infinity / -Infinity
 *  - Date objects
 *  - undefined
 */
function assertPayloadSafe(value: unknown, path: string): void {
  if (value === undefined) {
    throw new PayloadValidationError(
      `undefined is not allowed at ${path} (fail closed)`,
    );
  }

  if (value instanceof Date) {
    throw new PayloadValidationError(
      `Date objects are not allowed at ${path} — use ISO 8601 strings`,
    );
  }

  if (typeof value === "number") {
    if (Number.isNaN(value)) {
      throw new PayloadValidationError(`NaN is not allowed at ${path}`);
    }
    if (!Number.isFinite(value)) {
      throw new PayloadValidationError(
        `Infinity/-Infinity is not allowed at ${path}`,
      );
    }
  }

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      assertPayloadSafe(value[i], `${path}[${i}]`);
    }
  } else if (value !== null && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      assertPayloadSafe(v, `${path}.${k}`);
    }
  }
}

export class PayloadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PayloadValidationError";
  }
}

// ── Zod schemas ────────────────────────────────────────────────────

/**
 * Single event input — .strict() rejects unknown top-level keys.
 */
export const EventInputSchema = z
  .object({
    stream_id: z.string().min(1, "stream_id is required"),
    event_type: z.string().min(1, "event_type is required"),
    payload: z.record(z.unknown()).refine(
      (val) => {
        try {
          assertPayloadSafe(val, "payload");
          return true;
        } catch {
          return false;
        }
      },
      { message: "payload contains forbidden values (NaN, Infinity, Date, or undefined)" },
    ),
  })
  .strict();

/**
 * Batch input — array of events, .strict() on the wrapper.
 */
export const BatchEventInputSchema = z
  .object({
    events: z
      .array(EventInputSchema)
      .min(1, "At least one event is required")
      .max(1000, "Maximum 1000 events per batch"),
  })
  .strict();

/**
 * Query params for reading events.
 */
export const EventQuerySchema = z.object({
  stream_id: z.string().min(1).optional(),
  after_seq: z.coerce.number().int().min(0).optional(),
  limit: z.coerce.number().int().min(1).max(10000).optional(),
});

/**
 * Validate payload deeply (called separately for richer error messages).
 */
export function validatePayloadDeep(
  payload: Record<string, unknown>,
): void {
  assertPayloadSafe(payload, "payload");
}

export type EventInputType = z.infer<typeof EventInputSchema>;
export type BatchEventInputType = z.infer<typeof BatchEventInputSchema>;
