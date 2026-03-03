import type { FastifyInstance } from "fastify";
import {
  postEvent,
  postEventBatch,
  getEvents,
} from "../controllers/eventsController.js";

export async function eventRoutes(app: FastifyInstance): Promise<void> {
  app.post("/events", postEvent);
  app.post("/events/batch", postEventBatch);
  app.get("/events", getEvents);
}
