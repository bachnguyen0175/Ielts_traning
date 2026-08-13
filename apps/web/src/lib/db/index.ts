import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Runtime DB client. Uses the POOLED DATABASE_URL — Supabase's transaction
// pooler — over postgres-js, which suits serverless functions (no connection to
// keep warm). `prepare: false` is REQUIRED: transaction pooling does not
// support prepared statements. Migrations use the direct, unpooled URL instead
// (see drizzle.config.ts). See ADR-0009.
const client = postgres(process.env.DATABASE_URL!, { prepare: false });

export const db = drizzle(client, { schema });
