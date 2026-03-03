import type { FastifyInstance } from "fastify";
import { pool } from "../db/pool.js";

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async (_request, reply) => {
    try {
      const { rows } = await pool.query("SELECT 1 AS ok");
      reply.send({
        status: "ok",
        db: rows[0]?.ok === 1 ? "connected" : "error",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      reply.status(503).send({
        status: "error",
        db: "disconnected",
        message: err instanceof Error ? err.message : "unknown",
        timestamp: new Date().toISOString(),
      });
    }
  });
}
