import { FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { redactHeaders } from '../utils/redact.js';

declare module 'fastify' {
  interface FastifyRequest {
    requestId: string;
  }
}

export async function requestLogger(request: FastifyRequest, _reply: FastifyReply) {
  const requestId = (request.headers['x-request-id'] as string | undefined) ?? randomUUID();
  request.requestId = requestId;
  request.log = request.log.child({ requestId });

  request.log.info(
    {
      method: request.method,
      url: request.url,
      headers: redactHeaders(request.headers),
    },
    'request.start'
  );
}

export async function registerRequestLogger(app: import('fastify').FastifyInstance) {
  app.addHook('onRequest', requestLogger);
}

