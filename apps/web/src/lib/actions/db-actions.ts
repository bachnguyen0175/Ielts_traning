"use server";

import { auth } from "@clerk/nextjs/server";
import * as repos from "@/lib/db/repos";
import type { Attempt } from "@composed/domain";
import type { Profile, VocabItem } from "@/lib/data/repositories";

// Server actions = the boundary the client uses to reach the DB. The user id is
// ALWAYS taken from Clerk server-side (never from the client), and every repo
// query is scoped by it — a signed-in user can only touch their own data.
// Each returns null/false for guests so callers fall back to localStorage.

async function currentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

// ── Profile ──
export async function pullProfile(): Promise<Profile | null> {
  const userId = await currentUserId();
  return userId ? repos.getProfile(userId) : null;
}
export async function pushProfile(p: Profile): Promise<boolean> {
  const userId = await currentUserId();
  if (!userId) return false;
  await repos.saveProfile(userId, p);
  return true;
}

// ── Attempts (real-time sync) ──
export async function pullAttempt(id: string): Promise<Attempt | null> {
  const userId = await currentUserId();
  return userId ? repos.getAttempt(userId, id) : null;
}
export async function pullAttempts(): Promise<Attempt[]> {
  const userId = await currentUserId();
  return userId ? repos.listAttempts(userId) : [];
}
export async function pushAttempt(a: Attempt): Promise<boolean> {
  const userId = await currentUserId();
  if (!userId) return false;
  await repos.upsertAttempt(userId, a);
  return true;
}

// ── Vocabulary ──
export async function pullVocab(): Promise<VocabItem[]> {
  const userId = await currentUserId();
  return userId ? repos.listVocab(userId) : [];
}
export async function pushVocabAdd(item: VocabItem): Promise<boolean> {
  const userId = await currentUserId();
  if (!userId) return false;
  await repos.insertVocab(userId, item);
  return true;
}
export async function pushVocabReview(
  id: string,
  box: number,
  dueAt: number
): Promise<boolean> {
  const userId = await currentUserId();
  if (!userId) return false;
  await repos.updateVocabBox(userId, id, box, dueAt);
  return true;
}
export async function pushVocabRemove(id: string): Promise<boolean> {
  const userId = await currentUserId();
  if (!userId) return false;
  await repos.deleteVocab(userId, id);
  return true;
}
