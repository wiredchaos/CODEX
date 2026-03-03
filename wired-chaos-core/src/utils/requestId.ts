import { randomUUID } from "node:crypto";

/**
 * Generate a request ID (UUIDv4).
 */
export function generateRequestId(): string {
  return randomUUID();
}
