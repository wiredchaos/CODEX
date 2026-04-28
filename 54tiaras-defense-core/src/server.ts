import crypto from 'node:crypto';
import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { redactHeaders } from './utils/redact.js';
import { registerDb } from './db.js';
import { registerRedis } from './redis.js';
import { registerRequestLogger } from './middleware/requestLogger.js';
import { registerRateLimit } from './middleware/rateLimit.js';
import { registerErrorHandler } from './middleware/errorHandler.js';
import { registerAuth } from './middleware/auth.js';
import { registerRbac } from './middleware/rbac.js';

import { healthRoutes } from './routes/health.js';
import { organizationsRoutes } from './routes/organizations.js';
import { scansRoutes } from './routes/scans.js';
import { webhooksRoutes } from './routes/webhooks.js';
import { featureFlagsRoutes } from './routes/featureFlags.js';
import { alertsRoutes } from './routes/alerts.js';

export async function buildServer() {
  const app = Fastify({
    logger: false, // we use our own pino instance for consistent redaction
    disableRequestLogging: true,
    requestIdHeader: 'x-request-id',
    genReqId: (req) => (req.headers['x-request-id'] as string) ?? crypto.randomUUID(),
  });

  app.addHook('onRequest', async (req) => {
    // Never leak auth in logs.
    req.headers = redactHeaders(req.headers) as any;
  });

  await app.register(helmet, {
    global: true,
    contentSecurityPolicy: false, // API only; CSP handled at edge for UI surfaces if any
  });
  await app.register(cors, {
    origin: (origin, cb) => {
      // safe-by-default CORS: allow same-origin and explicit allowlist
      if (!origin) return cb(null, true);
      if (config.corsAllowlist.includes(origin)) return cb(null, true);
      return cb(new Error('CORS origin not allowed'), false);
    },
    credentials: false,
  });

  await registerRequestLogger(app);
  await registerRateLimit(app);
  await registerDb(app);
  await registerRedis(app);

  await registerErrorHandler(app);

  await registerAuth(app);
  await registerRbac(app);

  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(organizationsRoutes, { prefix: '/organizations' });
  await app.register(scansRoutes, { prefix: '/scans' });
  await app.register(webhooksRoutes, { prefix: '/webhooks' });
  await app.register(featureFlagsRoutes, { prefix: '/feature-flags' });
  await app.register(alertsRoutes, { prefix: '/alerts' });

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  const server = await buildServer();
  server.listen({ port: config.PORT, host: config.HOST }).then(() => {
    logger.info({ port: config.PORT }, '54Tiaras backend listening');
  }).catch((err) => {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  });
}

