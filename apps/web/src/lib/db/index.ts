import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Runtime DB client. Uses the POOLED DATABASE_URL over Neon's HTTP driver —
// stateless, ideal for serverless functions (no connection to keep warm).
// Migrations use the unpooled URL instead (see drizzle.config.ts).
export const db = drizzle(neon(process.env.DATABASE_URL!), { schema });
