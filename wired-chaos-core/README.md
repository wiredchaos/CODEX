# wired-chaos-core

Append-only, hash-chained event store with global ordering.

## Stack

- **Runtime:** Node.js 22 + TypeScript
- **Framework:** Fastify 5
- **Validation:** Zod (`.strict()` — unknown keys rejected)
- **Database:** PostgreSQL 16 via `pg` (no ORM)
- **Logging:** pino (via Fastify)
- **Hashing:** SHA-256 over canonical JSON
- **Locking:** `pg_advisory_xact_lock(1234567890)` — global serial ordering

## Quick Start

```bash
# 1. Start Postgres
cd docker && docker compose up -d postgres && cd ..

# 2. Install dependencies
npm install

# 3. Run migration
npm run migrate

# 4. Start server
npm run dev
```

## API

### `POST /events` — Append single event

```json
{
  "stream_id": "order-123",
  "event_type": "order.created",
  "payload": { "amount": 99.99, "currency": "USD" }
}
```

Returns `201` with the stored event including `global_seq`, `envelope_hash`, etc.

### `POST /events/batch` — Append batch

```json
{
  "events": [
    { "stream_id": "order-123", "event_type": "order.created", "payload": { "amount": 99.99 } },
    { "stream_id": "order-123", "event_type": "order.confirmed", "payload": { "confirmed": true } }
  ]
}
```

Returns `201` with `{ events: [...] }`.

### `GET /events` — Read events

Query params:
- `stream_id` — filter by stream (optional; omit for global feed)
- `after_seq` — read after this sequence number (default: 0)
- `limit` — max events to return (default: 1000, max: 10000)

### `GET /health` — Health check

Returns `200` with DB connectivity status.

## Validation (fail closed)

| Condition | Result |
|---|---|
| Unknown top-level keys | `400` |
| Missing required fields | `400` |
| Nulls where disallowed | `400` |
| NaN/Infinity in payload | `400` |
| Date objects in payload | `400` |

## Canonical JSON

Deterministic serialization for hash computation:

- Recursive lexicographic key sort on objects
- Preserve array order
- UTF-8 encoding
- Reject NaN, Infinity, -Infinity, undefined, Date objects

**Golden vector:**
```
Input:     {"z":1,"a":{"m":2,"b":3},"k":[1,2,3]}
Canonical: {"a":{"b":3,"m":2},"k":[1,2,3],"z":1}
SHA-256:   fdd2a604b797d25928a8badf9f70584b1426903ec04146e2608d5e4f4230486e
```

## Hash Rules

- `payload_hash = sha256(canonical(payload))`
- `envelope_hash = sha256(canonical(envelope excluding hashes and anchor fields))`

## Locking Strategy

1. `BEGIN` transaction
2. `SELECT pg_advisory_xact_lock(1234567890)` — global mutex
3. Read last global `envelope_hash` → `prev_global_envelope_hash`
4. Read last stream `envelope_hash` → `prev_envelope_hash`
5. Compute hashes
6. `INSERT` with `BIGSERIAL global_seq`
7. `COMMIT` — lock auto-releases

Batch: lock once, iterate inserts in order within single transaction.

## Append-Only Guarantees

- DB triggers block `UPDATE` and `DELETE` on the `events` table
- `app_user` role is granted only `SELECT` and `INSERT`
- No anchor columns on events table in v0
- Anchoring handled via `system.anchor_committed` events

## Concurrency Test

```bash
npm run test:concurrency
```

Fires 15 concurrent inserts and verifies:
1. `global_seq` strictly increasing, no duplicates
2. Every row `i > 1`: `prev_global_envelope_hash === envelope_hash(i-1)`
3. All `payload_hash` values are correct
4. Stream sequences are contiguous starting from 1

## Docker

```bash
cd docker
docker compose up --build
```

## Migration

```bash
# Apply
npm run migrate

# Rollback (manual)
psql $DATABASE_URL < src/db/migrations/001_create_events.rollback.sql
```
