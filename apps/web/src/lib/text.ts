/** Word count matching how IELTS counts (whitespace-separated tokens). */
export function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}
