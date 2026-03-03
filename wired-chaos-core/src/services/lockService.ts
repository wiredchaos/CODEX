import type { PoolClient } from "../db/pool.js";

/**
 * Advisory lock key — single global lock for event ordering.
 * pg_advisory_xact_lock is automatically released at transaction end.
 */
const GLOBAL_LOCK_KEY = 1234567890;

/**
 * Acquire the global advisory lock within the current transaction.
 * This blocks until the lock is available, ensuring serial event insertion.
 */
export async function acquireGlobalLock(client: PoolClient): Promise<void> {
  await client.query("SELECT pg_advisory_xact_lock($1)", [GLOBAL_LOCK_KEY]);
}
