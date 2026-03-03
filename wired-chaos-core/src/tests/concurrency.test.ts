/**
 * Concurrency test for wired-chaos-core event store.
 *
 * Fires 10+ concurrent inserts and verifies:
 *  1. global_seq is strictly increasing with no duplicates
 *  2. Every row i > 1: prev_global_envelope_hash === envelope_hash(i-1)
 *
 * Requires a running Postgres instance with the events table migrated.
 * Set DATABASE_URL env var or defaults to postgresql://postgres:postgres@localhost:5432/wired_chaos
 */

import pg from "pg";
import { computePayloadHash, computeEnvelopeHash } from "../services/hashService.js";
import { toCanonicalJson } from "../services/canonicalJson.js";
import { sha256 } from "../services/hashService.js";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/wired_chaos";

const CONCURRENCY = 15; // fire 15 concurrent inserts

interface StoredEvent {
  global_seq: string;
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

async function acquireLockAndInsert(
  pool: pg.Pool,
  streamId: string,
  eventType: string,
  payload: Record<string, unknown>,
): Promise<StoredEvent> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(1234567890)");

    // Read last global
    const { rows: globalRows } = await client.query<{ envelope_hash: string }>(
      "SELECT envelope_hash FROM events ORDER BY global_seq DESC LIMIT 1",
    );
    const prevGlobalEnvelopeHash = globalRows[0]?.envelope_hash ?? null;

    // Read last stream
    const { rows: streamRows } = await client.query<{
      envelope_hash: string;
      stream_seq: string;
    }>(
      "SELECT envelope_hash, stream_seq FROM events WHERE stream_id = $1 ORDER BY stream_seq DESC LIMIT 1",
      [streamId],
    );
    const prevEnvelopeHash = streamRows[0]?.envelope_hash ?? null;
    const streamSeq = streamRows[0] ? Number(streamRows[0].stream_seq) + 1 : 1;

    const payloadHash = computePayloadHash(payload);

    const envelopeForHash: Record<string, unknown> = {
      stream_id: streamId,
      stream_seq: streamSeq,
      event_type: eventType,
      payload,
      payload_hash: payloadHash,
    };
    const envelopeHash = computeEnvelopeHash(envelopeForHash);

    const { rows } = await client.query<StoredEvent>(
      `INSERT INTO events
         (stream_id, stream_seq, event_type, payload,
          payload_hash, envelope_hash, prev_envelope_hash, prev_global_envelope_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        streamId,
        streamSeq,
        eventType,
        JSON.stringify(payload),
        payloadHash,
        envelopeHash,
        prevEnvelopeHash,
        prevGlobalEnvelopeHash,
      ],
    );

    await client.query("COMMIT");
    return rows[0]!;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function main(): Promise<void> {
  console.log("=== wired-chaos-core concurrency test ===");
  console.log(`Concurrency level: ${CONCURRENCY}`);
  console.log(`Database: ${DATABASE_URL.replace(/:[^:@]+@/, ":***@")}\n`);

  const pool = new pg.Pool({ connectionString: DATABASE_URL, max: CONCURRENCY + 5 });

  // Clean slate
  try {
    // Temporarily disable triggers for cleanup
    await pool.query("ALTER TABLE events DISABLE TRIGGER trg_no_delete");
    await pool.query("DELETE FROM events");
    await pool.query("ALTER TABLE events ENABLE TRIGGER trg_no_delete");
    // Reset sequence
    await pool.query("ALTER SEQUENCE events_global_seq_seq RESTART WITH 1");
    console.log("✓ Cleaned events table\n");
  } catch (err) {
    console.error("Failed to clean events table:", err);
    await pool.end();
    process.exit(1);
  }

  // ── Fire concurrent inserts ────────────────────────────────────
  console.log(`Firing ${CONCURRENCY} concurrent inserts...`);
  const promises: Promise<StoredEvent>[] = [];

  for (let i = 0; i < CONCURRENCY; i++) {
    // Each insert targets a different stream to maximize contention variety
    const streamId = `stream-${i % 3}`; // 3 streams, overlapping
    const payload = { index: i, ts: new Date().toISOString(), data: `event-${i}` };
    promises.push(
      acquireLockAndInsert(pool, streamId, "test.concurrent", payload),
    );
  }

  const results = await Promise.all(promises);
  console.log(`✓ All ${results.length} inserts completed\n`);

  // ── Read back all events in global order ───────────────────────
  const { rows: allEvents } = await pool.query<StoredEvent>(
    "SELECT * FROM events ORDER BY global_seq ASC",
  );

  console.log(`Total events in DB: ${allEvents.length}`);
  console.log("---");

  // ── Verify 1: global_seq strictly increasing, no duplicates ────
  let pass = true;
  const seqSet = new Set<string>();

  for (let i = 0; i < allEvents.length; i++) {
    const event = allEvents[i]!;
    const seq = event.global_seq;

    if (seqSet.has(seq)) {
      console.error(`✗ DUPLICATE global_seq: ${seq}`);
      pass = false;
    }
    seqSet.add(seq);

    if (i > 0) {
      const prev = allEvents[i - 1]!;
      if (BigInt(event.global_seq) <= BigInt(prev.global_seq)) {
        console.error(
          `✗ global_seq not strictly increasing: ${prev.global_seq} -> ${event.global_seq}`,
        );
        pass = false;
      }
    }
  }

  if (pass) {
    console.log("✓ global_seq: strictly increasing, no duplicates");
  }

  // ── Verify 2: hash chain integrity ─────────────────────────────
  let chainPass = true;

  for (let i = 1; i < allEvents.length; i++) {
    const current = allEvents[i]!;
    const previous = allEvents[i - 1]!;

    if (current.prev_global_envelope_hash !== previous.envelope_hash) {
      console.error(
        `✗ Hash chain broken at global_seq ${current.global_seq}: ` +
          `prev_global_envelope_hash=${current.prev_global_envelope_hash} ` +
          `but previous envelope_hash=${previous.envelope_hash}`,
      );
      chainPass = false;
    }
  }

  // First event should have null prev_global_envelope_hash
  if (allEvents.length > 0 && allEvents[0]!.prev_global_envelope_hash !== null) {
    console.error(
      `✗ First event should have null prev_global_envelope_hash, got: ${allEvents[0]!.prev_global_envelope_hash}`,
    );
    chainPass = false;
  }

  if (chainPass) {
    console.log("✓ Hash chain: every row i>1 prev_global_envelope_hash === envelope_hash(i-1)");
  }

  // ── Verify 3: payload_hash correctness ─────────────────────────
  let hashPass = true;

  for (const event of allEvents) {
    const expectedPayloadHash = computePayloadHash(
      typeof event.payload === "string"
        ? JSON.parse(event.payload)
        : event.payload,
    );
    if (event.payload_hash !== expectedPayloadHash) {
      console.error(
        `✗ payload_hash mismatch at global_seq ${event.global_seq}: ` +
          `stored=${event.payload_hash} expected=${expectedPayloadHash}`,
      );
      hashPass = false;
    }
  }

  if (hashPass) {
    console.log("✓ Payload hashes: all verified");
  }

  // ── Verify 4: stream_seq per stream ────────────────────────────
  let streamPass = true;
  const streamSeqs = new Map<string, number[]>();

  for (const event of allEvents) {
    const seqs = streamSeqs.get(event.stream_id) ?? [];
    seqs.push(Number(event.stream_seq));
    streamSeqs.set(event.stream_id, seqs);
  }

  for (const [streamId, seqs] of streamSeqs) {
    for (let i = 0; i < seqs.length; i++) {
      if (seqs[i] !== i + 1) {
        console.error(
          `✗ stream_seq gap in ${streamId}: expected ${i + 1}, got ${seqs[i]}`,
        );
        streamPass = false;
      }
    }
  }

  if (streamPass) {
    console.log("✓ Stream sequences: all contiguous starting from 1");
  }

  // ── Summary ────────────────────────────────────────────────────
  console.log("\n---");
  const allPassed = pass && chainPass && hashPass && streamPass;
  if (allPassed) {
    console.log("🎉 ALL CHECKS PASSED");
  } else {
    console.log("❌ SOME CHECKS FAILED");
    process.exitCode = 1;
  }

  // Print event table summary
  console.log("\nEvent summary:");
  for (const event of allEvents) {
    console.log(
      `  seq=${event.global_seq} stream=${event.stream_id}:${event.stream_seq} ` +
        `hash=${event.envelope_hash.slice(0, 12)}… ` +
        `prev_global=${event.prev_global_envelope_hash?.slice(0, 12) ?? "null"}`,
    );
  }

  await pool.end();
}

main().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
