import {
  bigint,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import type {
  ResponseMap,
  SectionScore,
  Submission,
} from "@composed/domain";

// ── Auth.js (NextAuth v5) adapter tables — canonical Postgres schema ──────────
// See ADR-0002. Column names match what @auth/drizzle-adapter expects.

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// ── App tables — mirror @composed/domain, keyed off users.id ──────────────────
// Nested attempt data is stored as JSONB so the Drizzle repositories map 1:1 to
// the existing repository interfaces (ProfileRepository/AttemptRepository/…).
// Epoch-ms fields use bigint(mode:"number") to match the domain's numeric times.

export const profiles = pgTable("profile", {
  userId: text("userId")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  targetBand: real("target_band"),
  testDate: text("test_date"), // ISO date string
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const attempts = pgTable("attempt", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
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
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  term: text("term").notNull(),
  definition: text("definition"),
  source: text("source"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  box: integer("box").notNull().default(0),
  dueAt: bigint("due_at", { mode: "number" }).notNull(),
});
