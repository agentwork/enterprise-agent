import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = postgres(process.env.DATABASE_URL!);
// import { drizzle } from "drizzle-orm/postgres-js";
// import * as schema from "@/lib/db/schema";
// const db = drizzle(client, { schema });

async function reset() {
  console.log("Resetting database...");
  await client`DROP TABLE IF EXISTS "checkpoints" CASCADE`;
  await client`DROP TABLE IF EXISTS "messages" CASCADE`;
  await client`DROP TABLE IF EXISTS "threads" CASCADE`;
  await client`DROP TABLE IF EXISTS "profiles" CASCADE`;
  await client`DROP TABLE IF EXISTS "activities" CASCADE`;
  await client`DROP TABLE IF EXISTS "clients" CASCADE`;
  await client`DROP TABLE IF EXISTS "contacts" CASCADE`;
  await client`DROP TABLE IF EXISTS "deals" CASCADE`;
  await client`DROP TABLE IF EXISTS "document_chunks" CASCADE`;
  await client`DROP TABLE IF EXISTS "documents" CASCADE`;
  await client`DROP TYPE IF EXISTS "user_role" CASCADE`;
  console.log("Database reset complete.");
  process.exit(0);
}

reset().catch((err) => {
  console.error(err);
  process.exit(1);
});
