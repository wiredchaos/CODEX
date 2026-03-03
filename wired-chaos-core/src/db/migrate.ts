import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/wired_chaos";

async function migrate(): Promise<void> {
  const client = new pg.Client({ connectionString });
  await client.connect();

  try {
    const migrationPath = path.join(
      __dirname,
      "migrations",
      "001_create_events.sql",
    );
    const sql = fs.readFileSync(migrationPath, "utf-8");
    await client.query(sql);
    console.log("Migration 001_create_events applied successfully.");
  } finally {
    await client.end();
  }
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
