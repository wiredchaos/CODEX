import { FastifyPluginAsync } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { config } from '../config.js';

export const rateLimitPlugin: FastifyPluginAsync = async (app) => {
  await app.register(rateLimit, {
    max: config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_WINDOW_MS,
    // Avoid leaking request details in response bodies.
    errorResponseBuilder: (_req, context) => {
      return {
        error: 'rate_limited',
        message: `Too many requests. Retry in ${Math.ceil(context.ttl / 1000)}s.`,
      };
    },
  });
};

export async function registerRateLimit(app: Parameters<FastifyPluginAsync>[0]) {
  await rateLimitPlugin(app, {} as any);
}

