import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load local secrets (gitignored) for drizzle-kit migrate/push.
config({ path: ".env.local" });

// Migrations use the DIRECT (unpooled) Supabase connection — DDL doesn't play
// well with the transaction pooler. The app runtime uses the pooled
// DATABASE_URL. See ADR-0009.
const migrationUrl =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: migrationUrl },
});
