import { env } from "../config/env.js";

/**
 * Re-export pino logger configured from env.
 * Fastify uses its own pino instance; this is for non-request contexts.
 */
import pino from "pino";

export const logger = pino({
  level: env.LOG_LEVEL,
  transport:
    env.LOG_LEVEL === "debug"
      ? { target: "pino/file", options: { destination: 1 } }
      : undefined,
});
