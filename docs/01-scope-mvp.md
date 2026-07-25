# Scope & MVP

> Status: 🟡 draft

## MVP definition

**One authentic Academic full mock exam, delivered end-to-end.**

A candidate can sit a complete mock under realistic conditions and receive
immediate objective results (Listening + Reading) plus captured submissions
(Writing essays, Speaking audio) for later review.

### The authentic sitting

| Section | Time | MVP behavior |
|---------|------|--------------|
| Listening | ~30 min + review | Audio plays **once**, single timer, 40 questions |
| Reading | 60 min | 3 academic passages, 40 questions, highlight + review tools |
| Writing | 60 min | Task 1 (20 min target) + Task 2 (40 min target), typed in-app |
| Speaking | 11–14 min | 3-part format, timed prompts, **audio recorded** |

> Real IELTS runs L→R→W in one sitting with no breaks; Speaking may be same day
> or separate. MVP mirrors the L→R→W block; Speaking can be a separate module.

## In scope (MVP)

- **Elaborate landing page** — high-polish top-of-funnel surface that makes the
  "authentic conditions" value prop legible and credible
  ([features/landing-page.md](./features/landing-page.md)). Deliberate exception
  to "simplicity first."
- Account + auth (so attempts persist).
- One complete seeded Academic mock (all four skills).
- Faithful timing engine (section timers, play-once audio, auto-advance on
  expiry).
- Computer-delivered-style UI: question navigation, review/flag, text highlight.
- **Auto-scoring** for Listening & Reading from an answer key → band conversion.
- **Submission capture** for Writing (text) and Speaking (audio), stored per
  attempt.
- Results screen: L/R band scores + links to review W/S submissions.

## Out of scope (MVP)

- AI band scoring for Writing/Speaking → **Phase 2**.
- Live AI examiner / conversational Speaking → **Phase 3**.
- Multiple test versions / large question bank → post-MVP.
- General Training test type.
- Tutor/classroom features, analytics dashboards.
- Content lessons, study plans, spaced repetition.

## Phased roadmap

| Phase | Theme | Highlights |
|-------|-------|-----------|
| **P1 — MVP** | Authentic sitting | 1 full mock, timing engine, L/R auto-score, W/S capture |
| **P2** | Credible scoring | AI band scoring for Writing (4 criteria), self-review tools |
| **P3** | Live Speaking | AI examiner (3-part interview), Speaking band scoring |
| **P4** | Scale & content | Multiple tests, authoring pipeline, progress analytics |
| **P5** | Breadth | General Training, tutor/classroom, monetization tiers |

## MVP acceptance criteria (draft)

- [ ] A user can register, start, and complete a full mock in one session.
- [ ] Listening audio cannot be paused, rewound, or replayed.
- [ ] Each section enforces its own timer and auto-advances on expiry.
- [ ] L & R produce a band score from the answer key on submission.
- [ ] Writing text and Speaking audio are persisted and retrievable per attempt.
- [ ] No correctness feedback is shown mid-test.
