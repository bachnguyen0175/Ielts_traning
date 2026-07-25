// ⚠️ TEMPORARY MOCK DATA — demo flashcard words.
// These are hand-written sample words used ONLY when the user clicks
// "Load example words" on an empty /vocab screen, so the flashcard UI is
// demonstrable before any real words have been saved. They are NOT injected
// automatically. In production, vocabulary comes entirely from words the user
// saves during Review. Safe to delete. See docs/mock-data-registry.md.

export const EXAMPLE_VOCAB: Array<{
  term: string;
  definition: string;
  source: string;
}> = [
  { term: "mitigate", definition: "to make something less severe or harmful", source: "Example words" },
  { term: "ubiquitous", definition: "present or found everywhere", source: "Example words" },
  { term: "empirical", definition: "based on observation or experiment, not theory", source: "Example words" },
  { term: "paradigm", definition: "a typical example or model of something", source: "Example words" },
  { term: "salient", definition: "most noticeable or important", source: "Example words" },
  { term: "arbitrary", definition: "based on random choice rather than reason", source: "Example words" },
];
