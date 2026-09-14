import {
  bigint,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { ResponseMap, SectionScore, Submission, Test } from "@composed/domain";

// Auth is handled by Clerk (users/sessions live on Clerk's side), so there are
// no local auth tables. App tables key off the Clerk user id (a text string).
// Nested attempt data is JSONB so the Drizzle repos map 1:1 to the repository
// interfaces; epoch-ms fields use bigint(mode:"number"). See ADR-0003.

export const profiles = pgTable("profile", {
  userId: text("userId").primaryKey(), // Clerk user id
  targetBand: real("target_band"),
  testDate: text("test_date"), // ISO date string
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const attempts = pgTable("attempt", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull(), // Clerk user id
  testId: text("test_id").notNull(),
  status: text("status").notNull(), // AttemptStatus
  startedAt: bigint("started_at", { mode: "number" }).notNull(),
  sectionStartedAt: jsonb("section_started_at")
    .$type<Record<string, number>>()
    .notNull()
    .default({}),
  currentSectionIndex: integer("current_section_index").notNull().default(0),
  responses: jsonb("responses").$type<ResponseMap>().notNull().default({}),
  flagged: jsonb("flagged").$type<number[]>().notNull().default([]),
  submissions: jsonb("submissions").$type<Submission[]>().notNull().default([]),
  results: jsonb("results").$type<SectionScore[]>(),
  overall: real("overall"),
  submittedAt: bigint("submitted_at", { mode: "number" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const vocab = pgTable("vocab", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull(), // Clerk user id
  term: text("term").notNull(),
  definition: text("definition"),
  source: text("source"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  box: integer("box").notNull().default(0),
  dueAt: bigint("due_at", { mode: "number" }).notNull(),
});

// Tests an admin has published for everyone. The whole parsed `Test` is stored
// as one JSONB document, the same shape the client repositories hand to the
// player, so a published test needs no separate question/option tables.
//
// Unlike `attempt` and `vocab`, this table is NOT keyed by the reading user:
// every signed-in user reads every row. `publishedBy` records who put it there.
export const publishedTests = pgTable("published_test", {
  id: text("id").primaryKey(), // the Test's own slug id
  title: text("title").notNull(),
  data: jsonb("data").$type<Test>().notNull(),
  publishedBy: text("published_by").notNull(), // Clerk user id
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});
