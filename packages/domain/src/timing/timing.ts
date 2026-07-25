// Pure timing math. The timer is anchored to a persisted `startedAt` (epoch ms)
// so a reload resumes with the clock still running ("resume with elapsed-time
// enforcement"). In mock mode this is client-computed; the same functions serve
// a server authority later.

export function elapsedSeconds(startedAtMs: number, nowMs: number): number {
  return Math.floor((nowMs - startedAtMs) / 1000);
}

export function remainingSeconds(
  startedAtMs: number,
  durationSeconds: number,
  nowMs: number
): number {
  return Math.max(0, durationSeconds - elapsedSeconds(startedAtMs, nowMs));
}

export function isExpired(
  startedAtMs: number,
  durationSeconds: number,
  nowMs: number
): boolean {
  return nowMs - startedAtMs >= durationSeconds * 1000;
}

export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export function nextSectionIndex(
  sectionCount: number,
  currentIndex: number
): number | null {
  const next = currentIndex + 1;
  return next < sectionCount ? next : null;
}
