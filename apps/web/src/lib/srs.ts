// ⚠️ PLACEHOLDER / MOCK LOGIC — spaced-repetition scheduler.
// This is a deliberately simple Leitner-box scheduler for the FE/mock phase so
// the Flashcards screen is usable without a backend. In the BE phase it will be
// REPLACED by a real SRS (e.g. SM-2/FSRS) with server-side persistence and
// timezone-correct scheduling. See docs/mock-data-registry.md.

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Days until the next review for each Leitner box (mock intervals). */
const INTERVALS_DAYS = [0, 1, 3, 7, 16];
export const MAX_BOX = INTERVALS_DAYS.length - 1;

/** Next box: promote on remembered (capped), reset to 0 on forgotten. */
export function nextBox(box: number, remembered: boolean): number {
  if (!remembered) return 0;
  return Math.min(box + 1, MAX_BOX);
}

/** Mock next-review timestamp for a box, measured from `now`. */
export function dueAt(box: number, now: number): number {
  const clamped = Math.max(0, Math.min(box, MAX_BOX));
  return now + INTERVALS_DAYS[clamped] * DAY_MS;
}

/** Compute the updated {box, dueAt} after grading a card. */
export function reviewCard(
  card: { box: number },
  remembered: boolean,
  now: number
): { box: number; dueAt: number } {
  const box = nextBox(card.box, remembered);
  return { box, dueAt: dueAt(box, now) };
}

export function isDue(card: { dueAt: number }, now: number): boolean {
  return card.dueAt <= now;
}
