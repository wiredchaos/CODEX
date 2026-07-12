import PgBoss from 'pg-boss';
import { loadEnv } from '../../../packages/shared/src/index.js';
export async function startWorker() { const boss = new PgBoss(loadEnv().DATABASE_URL); await boss.start(); return boss; }
