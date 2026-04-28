import pino from 'pino';

const REDACT_PATHS: string[] = [
  'req.headers.authorization',
  'req.headers.cookie',
  'headers.authorization',
  'headers.cookie',
  '*.authorization',
  '*.token',
  '*.accessToken',
  '*.refreshToken',
  '*.apiKey',
  '*.secret',
  '*.password',
];

export function createLogger(level: string = process.env.LOG_LEVEL ?? 'info') {
  return pino({
    level,
    redact: {
      paths: REDACT_PATHS,
      remove: true,
    },
    base: undefined,
    messageKey: 'message',
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}

export const logger = createLogger();

