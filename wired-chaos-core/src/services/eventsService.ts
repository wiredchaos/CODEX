import { pool, type PoolClient } from "../db/pool.js";
import { acquireGlobalLock } from "./lockService.js";
import { computePayloadHash, computeEnvelopeHash } from "./hashService.js";

// ── Types ──────────────────────────────────────────────────────────

export interface EventInput {
  stream_id: string;
  event_type: string;
  payload: Record<string, unknown>;
}

export interface StoredEvent {
  global_seq: string; // bigint comes back as string from pg
  stream_id: string;
  stream_seq: string;
  event_type: string;
  payload: Record<string, unknown>;
  payload_hash: string;
  envelope_hash: string;
  prev_envelope_hash: string | null;
  prev_global_envelope_hash: string | null;
  created_at: string;
}

// ── Queries ────────────────────────────────────────────────────────

async function getLastGlobalEvent(
  client: PoolClient,
): Promise<{ envelope_hash: string } | null> {
  const { rows } = await client.query<{ envelope_hash: string }>(
    "SELECT envelope_hash FROM events ORDER BY global_seq DESC LIMIT 1",
  );
  return rows[0] ?? null;
}

async function getLastStreamEvent(
  client: PoolClient,
  streamId: string,
): Promise<{ envelope_hash: string; stream_seq: string } | null> {
  const { rows } = await client.query<{
    envelope_hash: string;
    stream_seq: string;
  }>(
    "SELECT envelope_hash, stream_seq FROM events WHERE stream_id = $1 ORDER BY stream_seq DESC LIMIT 1",
    [streamId],
  );
  return rows[0] ?? null;
}

async function insertEvent(
  client: PoolClient,
  params: {
    stream_id: string;
    stream_seq: number;
    event_type: string;
    payload: Record<string, unknown>;
    payload_hash: string;
    envelope_hash: string;
    prev_envelope_hash: string | null;
    prev_global_envelope_hash: string | null;
  },
): Promise<StoredEvent> {
  const { rows } = await client.query<StoredEvent>(
    `INSERT INTO events
       (stream_id, stream_seq, event_type, payload,
        payload_hash, envelope_hash, prev_envelope_hash, prev_global_envelope_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      params.stream_id,
      params.stream_seq,
      params.event_type,
      JSON.stringify(params.payload),
      params.payload_hash,
      params.envelope_hash,
      params.prev_envelope_hash,
      params.prev_global_envelope_hash,
    ],
  );
  return rows[0]!;
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Append a single event. Acquires global advisory lock.
 */
export async function appendEvent(input: EventInput): Promise<StoredEvent> {
  const results = await appendEvents([input]);
  return results[0]!;
}

/**
 * Append a batch of events atomically.
 * Lock once per batch transaction, insert in order.
 */
export async function appendEvents(
  inputs: EventInput[],
): Promise<StoredEvent[]> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await acquireGlobalLock(client);

    const results: StoredEvent[] = [];

    // Track running state within the batch
    let lastGlobal = await getLastGlobalEvent(client);
    // Cache stream state per stream_id within the batch
    const streamCache = new Map<
      string,
      { envelope_hash: string; stream_seq: number }
    >();

    for (const input of inputs) {
      // Resolve stream state (check cache first, then DB)
      let streamState = streamCache.get(input.stream_id);
      if (!streamState) {
        const dbStream = await getLastStreamEvent(client, input.stream_id);
        if (dbStream) {
          streamState = {
            envelope_hash: dbStream.envelope_hash,
            stream_seq: Number(dbStream.stream_seq),
          };
        }
      }

      const streamSeq = streamState ? streamState.stream_seq + 1 : 1;
      const prevEnvelopeHash = streamState?.envelope_hash ?? null;
      const prevGlobalEnvelopeHash = lastGlobal?.envelope_hash ?? null;

      // Compute hashes
      const payloadHash = computePayloadHash(input.payload);

      // Build the hashable envelope (without hash/anchor fields)
      const envelopeForHash: Record<string, unknown> = {
        stream_id: input.stream_id,
        stream_seq: streamSeq,
        event_type: input.event_type,
        payload: input.payload,
        payload_hash: payloadHash,
      };
      const envelopeHash = computeEnvelopeHash(envelopeForHash);

      const stored = await insertEvent(client, {
        stream_id: input.stream_id,
        stream_seq: streamSeq,
        event_type: input.event_type,
        payload: input.payload,
        payload_hash: payloadHash,
        envelope_hash: envelopeHash,
        prev_envelope_hash: prevEnvelopeHash,
        prev_global_envelope_hash: prevGlobalEnvelopeHash,
      });

      results.push(stored);

      // Update running state for next iteration
      lastGlobal = { envelope_hash: envelopeHash };
      streamCache.set(input.stream_id, {
        envelope_hash: envelopeHash,
        stream_seq: streamSeq,
      });
    }

    await client.query("COMMIT");
    return results;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Read events from a stream.
 */
export async function getStreamEvents(
  streamId: string,
  opts?: { afterSeq?: number; limit?: number },
): Promise<StoredEvent[]> {
  const afterSeq = opts?.afterSeq ?? 0;
  const limit = opts?.limit ?? 1000;

  const { rows } = await pool.query<StoredEvent>(
    `SELECT * FROM events
     WHERE stream_id = $1 AND stream_seq > $2
     ORDER BY stream_seq ASC
     LIMIT $3`,
    [streamId, afterSeq, limit],
  );
  return rows;
}

/**
 * Read events globally ordered.
 */
export async function getGlobalEvents(
  opts?: { afterSeq?: number; limit?: number },
): Promise<StoredEvent[]> {
  const afterSeq = opts?.afterSeq ?? 0;
  const limit = opts?.limit ?? 1000;

  const { rows } = await pool.query<StoredEvent>(
    `SELECT * FROM events
     WHERE global_seq > $1
     ORDER BY global_seq ASC
     LIMIT $2`,
    [afterSeq, limit],
  );
  return rows;
}
