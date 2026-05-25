import { Pool } from "pg";
import { env } from "./env";

export const db = new Pool({
  connectionString: env.databaseUrl,
});

export async function connectDatabase() {
  const client = await db.connect();

  try {
    await client.query("SELECT 1");
    console.info("PostgreSQL connection established");
  } finally {
    client.release();
  }
}

export async function closeDatabase() {
  await db.end();
}
