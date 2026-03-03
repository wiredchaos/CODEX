import Fastify from "fastify";
import { env } from "./config/env.js";
import { healthRoutes } from "./routes/health.js";
import { eventRoutes } from "./routes/events.js";
import { generateRequestId } from "./utils/requestId.js";

export function buildApp() {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
    },
    genReqId: () => generateRequestId(),
    bodyLimit: 1_048_576, // 1 MB
  });

  // ── Routes ─────────────────────────────────────────────────────
  app.register(healthRoutes);
  app.register(eventRoutes);

  // ── Global error handler ───────────────────────────────────────
  app.setErrorHandler((error: Error & { statusCode?: number }, _request, reply) => {
    const statusCode = error.statusCode ?? 500;
    if (statusCode >= 500) {
      app.log.error(error);
    }
    reply.status(statusCode).send({
      error: statusCode >= 500 ? "Internal Server Error" : error.message,
    });
  });

  return app;
}
