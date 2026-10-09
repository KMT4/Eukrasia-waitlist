import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");

const sql = neon(connectionString);
const schema = await readFile(new URL("../schema.sql", import.meta.url), "utf8");
const statements = schema
  .split(/;\s*(?:\n|$)/)
  .map((statement) => statement.trim())
  .filter(Boolean);
for (const statement of statements) await sql.query(statement);
const result = await sql`select count(*)::int as entries from public.waitlist_entries`;
console.log(`Neon waitlist schema ready. Entries: ${result[0].entries}`);
