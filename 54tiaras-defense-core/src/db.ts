import { PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { config } from './config.js';

export const prisma = new PrismaClient({
  datasources: { db: { url: config.DATABASE_URL } },
  log: config.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export async function registerDb(app: FastifyInstance) {
  app.decorate('prisma', prisma);
  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

