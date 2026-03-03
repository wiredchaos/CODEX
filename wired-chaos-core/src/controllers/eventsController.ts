import type { FastifyRequest, FastifyReply } from "fastify";
import {
  EventInputSchema,
  BatchEventInputSchema,
  EventQuerySchema,
  validatePayloadDeep,
  PayloadValidationError,
} from "../schemas/eventEnvelope.js";
import { CanonicalJsonError } from "../services/canonicalJson.js";
import {
  appendEvent,
  appendEvents,
  getStreamEvents,
  getGlobalEvents,
} from "../services/eventsService.js";

// ── Helpers ────────────────────────────────────────────────────────

function errorResponse(reply: FastifyReply, status: number, message: string) {
  return reply.status(status).send({ error: message });
}

// ── POST /events ───────────────────────────────────────────────────

export async function postEvent(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const parsed = EventInputSchema.safeParse(request.body);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    errorResponse(reply, 400, msg);
    return;
  }

  try {
    validatePayloadDeep(parsed.data.payload as Record<string, unknown>);
  } catch (err) {
    if (err instanceof PayloadValidationError) {
      errorResponse(reply, 400, err.message);
      return;
    }
    throw err;
  }

  try {
    const stored = await appendEvent({
      stream_id: parsed.data.stream_id,
      event_type: parsed.data.event_type,
      payload: parsed.data.payload as Record<string, unknown>,
    });
    reply.status(201).send(stored);
  } catch (err) {
    if (err instanceof CanonicalJsonError) {
      errorResponse(reply, 400, err.message);
      return;
    }
    throw err;
  }
}

// ── POST /events/batch ─────────────────────────────────────────────

export async function postEventBatch(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const parsed = BatchEventInputSchema.safeParse(request.body);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    errorResponse(reply, 400, msg);
    return;
  }

  try {
    for (const event of parsed.data.events) {
      validatePayloadDeep(event.payload as Record<string, unknown>);
    }
  } catch (err) {
    if (err instanceof PayloadValidationError) {
      errorResponse(reply, 400, err.message);
      return;
    }
    throw err;
  }

  try {
    const inputs = parsed.data.events.map((e) => ({
      stream_id: e.stream_id,
      event_type: e.event_type,
      payload: e.payload as Record<string, unknown>,
    }));
    const stored = await appendEvents(inputs);
    reply.status(201).send({ events: stored });
  } catch (err) {
    if (err instanceof CanonicalJsonError) {
      errorResponse(reply, 400, err.message);
      return;
    }
    throw err;
  }
}

// ── GET /events ────────────────────────────────────────────────────

export async function getEvents(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const parsed = EventQuerySchema.safeParse(request.query as Record<string, unknown>);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    errorResponse(reply, 400, msg);
    return;
  }

  const streamId = parsed.data.stream_id as string | undefined;
  const afterSeq = parsed.data.after_seq as number | undefined;
  const queryLimit = parsed.data.limit as number | undefined;

  if (streamId) {
    const events = await getStreamEvents(streamId, {
      afterSeq,
      limit: queryLimit,
    });
    reply.send({ events });
  } else {
    const events = await getGlobalEvents({ afterSeq, limit: queryLimit });
    reply.send({ events });
  }
}
