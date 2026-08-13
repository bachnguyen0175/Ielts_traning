import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load local secrets (gitignored) for drizzle-kit migrate/push.
config({ path: ".env.local" });

// Migrations use the DIRECT (unpooled) Neon connection — DDL doesn't play well
// with the PgBouncer pooler. The app runtime uses the pooled DATABASE_URL.
const migrationUrl =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: migrationUrl },
});
