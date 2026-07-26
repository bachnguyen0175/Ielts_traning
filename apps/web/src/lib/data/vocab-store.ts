import type { VocabItem } from "./repositories";
import { vocabRepo } from "./client";
import { dueAt, reviewCard } from "../srs";
import {
  pullVocab,
  pushVocabAdd,
  pushVocabRemove,
  pushVocabReview,
} from "../actions/db-actions";

// One async vocab interface for the UI. Guests → localStorage; signed-in →
// Neon via server actions. Same VocabItem shape flows through either path.
export interface VocabStore {
  list(): Promise<VocabItem[]>;
  add(input: { term: string; definition?: string; source?: string }): Promise<VocabItem | null>;
  review(item: VocabItem, remembered: boolean): Promise<void>;
  remove(id: string): Promise<void>;
}

export function vocabStore(userId: string | null): VocabStore {
  if (!userId) {
    const repo = vocabRepo(); // localStorage (sync, wrapped as async)
    return {
      list: async () => repo.list(),
      add: async (input) => repo.add(input),
      review: async (item, remembered) => repo.review(item.id, remembered),
      remove: async (id) => repo.remove(id),
    };
  }

  // Signed-in: build the item client-side (same shape as the local repo), then
  // persist via server actions. SRS math is client-computed (non-sensitive).
  return {
    list: () => pullVocab(),
    add: async (input) => {
      const term = input.term.trim();
      if (!term) return null;
      const now = Date.now();
      const item: VocabItem = {
        id: crypto.randomUUID(),
        term,
        definition: input.definition?.trim() || undefined,
        source: input.source,
        createdAt: now,
        box: 0,
        dueAt: dueAt(0, now),
      };
      return (await pushVocabAdd(item)) ? item : null;
    },
    review: async (item, remembered) => {
      const { box, dueAt: next } = reviewCard(item, remembered, Date.now());
      await pushVocabReview(item.id, box, next);
    },
    remove: async (id) => {
      await pushVocabRemove(id);
    },
  };
}
