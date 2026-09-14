import "server-only";
import { and, desc, eq } from "drizzle-orm";
import type { Attempt, Test } from "@composed/domain";
import { db } from "./index";
import { attempts, profiles, publishedTests, vocab } from "./schema";
import type { Profile, VocabItem } from "../data/repositories";

// Server-only DB repositories, keyed by the authenticated user's id. These back
// the server actions (lib/actions/*) and mirror the localStorage repository
// shapes so the same domain objects flow through. See ADR-0003.

// ── Profile ───────────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const [row] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId));
  if (!row) return null;
  return {
    targetBand: row.targetBand ?? undefined,
    testDate: row.testDate ?? undefined,
  };
}

export async function saveProfile(userId: string, p: Profile): Promise<void> {
  await db
    .insert(profiles)
    .values({
      userId,
      targetBand: p.targetBand ?? null,
      testDate: p.testDate ?? null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        targetBand: p.targetBand ?? null,
        testDate: p.testDate ?? null,
        updatedAt: new Date(),
      },
    });
}

// ── Attempts (full write-through for real-time cross-device sync) ─────────────

function rowToAttempt(r: typeof attempts.$inferSelect): Attempt {
  return {
    id: r.id,
    testId: r.testId,
    status: r.status as Attempt["status"],
    // bigint columns can surface as string from the driver — coerce to number
    // (epoch-ms is well within Number's safe range).
    startedAt: Number(r.startedAt),
    sectionStartedAt: r.sectionStartedAt,
    currentSectionIndex: r.currentSectionIndex,
    responses: r.responses,
    flagged: r.flagged,
    submissions: r.submissions,
    results: r.results ?? undefined,
    overall: r.overall ?? undefined,
    submittedAt: r.submittedAt == null ? undefined : Number(r.submittedAt),
  };
}

export async function getAttempt(
  userId: string,
  id: string
): Promise<Attempt | null> {
  const [row] = await db
    .select()
    .from(attempts)
    .where(and(eq(attempts.id, id), eq(attempts.userId, userId)));
  return row ? rowToAttempt(row) : null;
}

export async function listAttempts(userId: string): Promise<Attempt[]> {
  const rows = await db
    .select()
    .from(attempts)
    .where(eq(attempts.userId, userId))
    .orderBy(desc(attempts.startedAt));
  return rows.map(rowToAttempt);
}

/** Insert-or-replace the whole attempt (last-write-wins on the doc). */
export async function upsertAttempt(
  userId: string,
  a: Attempt
): Promise<void> {
  const values = {
    id: a.id,
    userId,
    testId: a.testId,
    status: a.status,
    startedAt: a.startedAt,
    sectionStartedAt: a.sectionStartedAt,
    currentSectionIndex: a.currentSectionIndex,
    responses: a.responses,
    flagged: a.flagged,
    submissions: a.submissions,
    results: a.results ?? null,
    overall: a.overall ?? null,
    submittedAt: a.submittedAt ?? null,
  };
  await db
    .insert(attempts)
    .values(values)
    .onConflictDoUpdate({
      target: attempts.id,
      // Only update if the existing row belongs to this user — a client can send
      // an arbitrary attempt id, so never let one user overwrite another's row.
      setWhere: eq(attempts.userId, userId),
      set: {
        status: values.status,
        sectionStartedAt: values.sectionStartedAt,
        currentSectionIndex: values.currentSectionIndex,
        responses: values.responses,
        flagged: values.flagged,
        submissions: values.submissions,
        results: values.results,
        overall: values.overall,
        submittedAt: values.submittedAt,
      },
    });
}

// ── Vocabulary ────────────────────────────────────────────────────────────────

export async function listVocab(userId: string): Promise<VocabItem[]> {
  const rows = await db
    .select()
    .from(vocab)
    .where(eq(vocab.userId, userId))
    .orderBy(desc(vocab.createdAt));
  return rows.map((r) => ({
    id: r.id,
    term: r.term,
    definition: r.definition ?? undefined,
    source: r.source ?? undefined,
    createdAt: Number(r.createdAt),
    box: r.box,
    dueAt: Number(r.dueAt),
  }));
}

export async function insertVocab(
  userId: string,
  item: VocabItem
): Promise<void> {
  await db.insert(vocab).values({
    id: item.id,
    userId,
    term: item.term,
    definition: item.definition ?? null,
    source: item.source ?? null,
    createdAt: item.createdAt,
    box: item.box,
    dueAt: item.dueAt,
  });
}

export async function updateVocabBox(
  userId: string,
  id: string,
  box: number,
  dueAt: number
): Promise<void> {
  await db
    .update(vocab)
    .set({ box, dueAt })
    .where(and(eq(vocab.id, id), eq(vocab.userId, userId)));
}

export async function deleteVocab(userId: string, id: string): Promise<void> {
  await db.delete(vocab).where(and(eq(vocab.id, id), eq(vocab.userId, userId)));
}


// ── Published tests ──
// Readable by every signed-in user; the admin guard lives in the server action,
// which is the only caller that writes. This is the one table not scoped by the
// reading user's id — that is the point of it.

export async function listPublished(): Promise<Test[]> {
  const rows = await db
    .select({ data: publishedTests.data })
    .from(publishedTests)
    .orderBy(desc(publishedTests.createdAt));
  return rows.map((r) => r.data);
}

export async function upsertPublished(
  userId: string,
  test: Test
): Promise<void> {
  await db
    .insert(publishedTests)
    .values({ id: test.id, title: test.title, data: test, publishedBy: userId })
    .onConflictDoUpdate({
      target: publishedTests.id,
      set: { title: test.title, data: test, updatedAt: new Date() },
    });
}

export async function deletePublished(id: string): Promise<void> {
  await db.delete(publishedTests).where(eq(publishedTests.id, id));
}
