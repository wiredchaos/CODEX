import { Redis } from 'ioredis';
import type { FastifyInstance } from 'fastify';
import { getConfig } from './config.js';

export function createRedis() {
  const config = getConfig();
  return new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: true,
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}

export async function registerRedis(app: FastifyInstance) {
  const redis = createRedis();
  await redis.connect().catch(() => undefined);
  app.decorate('redis', redis);
  app.addHook('onClose', async (instance) => {
    await instance.redis.quit().catch(() => undefined);
  });
}

