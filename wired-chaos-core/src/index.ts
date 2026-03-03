import { buildApp } from "./app.js";
import { env } from "./config/env.js";

const app = buildApp();

async function start(): Promise<void> {
  try {
    await app.listen({ host: env.HOST, port: env.PORT });
    app.log.info(`wired-chaos-core listening on ${env.HOST}:${env.PORT}`);
  } catch (err) {
    app.log.fatal(err);
    process.exit(1);
  }
}

start();
