import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { redactObject } from '../utils/redact.js';

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((err, _req, reply) => {
    const requestId = reply.request?.id;

    if (err instanceof ZodError) {
      return reply.status(400).send({
        error: 'invalid_request',
        message: 'Request validation failed',
        requestId,
        issues: err.issues.map((i) => ({
          path: i.path.join('.'),
          code: i.code,
          message: i.message
        }))
      });
    }

    const statusCode = (err as any)?.statusCode ?? 500;
    const code = (err as any)?.code ?? 'internal_error';
    const message = statusCode >= 500 ? 'Internal server error' : String((err as any)?.message ?? 'Request failed');

    // Never leak raw error details; log internally with request ID.
    app.log.error({ err: redactObject({ message: (err as any)?.message, code: (err as any)?.code }), requestId }, 'Unhandled error');
    return reply.status(statusCode).send({
      error: code,
      message,
      requestId
    });
  });
}

