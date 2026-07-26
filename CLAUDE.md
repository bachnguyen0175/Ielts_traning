# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## Project: IELTS Training

An IELTS **Academic** practice platform whose differentiator is **authentic
test-day conditions**. Read [`docs/README.md`](./docs/README.md) before
implementing — it's the source of truth.

- **Stack:** Next.js (App Router) · Vercel · Vercel AI SDK (scoring is a later phase).
- **Repo layout:** pnpm-workspace monorepo — the app lives in **`apps/web`**
  (not the root). Run from the root: `pnpm dev` / `pnpm build` / `pnpm test`
  / `pnpm test:e2e` (these delegate to `--filter web`). Shared packages go in
  `packages/` when needed. See [`docs/architecture/decisions/0005-repo-structure.md`](./docs/architecture/decisions/0005-repo-structure.md).
- **MVP:** one full mock exam; Listening/Reading auto-scored, Writing/Speaking
  captured (scoring deferred). See [`docs/01-scope-mvp.md`](./docs/01-scope-mvp.md).
- **Domain truth:** test format, timing, and scoring rules live in
  [`docs/domain/`](./docs/domain/ielts-overview.md). Features must conform to them.
- **Build strategy:** **mock-first FE** — screens depend on a localStorage
  repository seam (`apps/web/src/lib/data`), pure logic lives in
  `packages/@composed/domain`. Real DB/auth/AI scoring are the **BE phase**.
- **Launch mode:** **PUBLIC product** *(2026-07-26 pivot from "private personal
  tool")* — real users sign up. **Deployed content must be original or licensed;
  Cambridge material is NEVER deployed.** The Cambridge ingester stays a
  local-only dev aid (gitignored output). Do **not** commit/ship Cambridge
  passages or question wording (copyright). See [`content/README.md`](./content/README.md).
- **Status:** FE phase complete & verified; flow `/ → /start → /tests →
  /mock?test=<id> → /mock/run → /mock/results → /mock/review · /progress`.

**Fidelity rules (non-negotiable in code):**
- Listening audio plays **once** — no pause/rewind/replay.
- Timing authority and answer keys belong **server-side**; the client never
  receives correct answers before submission. *(FE-phase caveat: while mock-first,
  content/keys are client-side; this rule is enforced once the BE lands.)*
- **No correctness feedback** until the whole test is submitted.

Record significant technical decisions as ADRs in
[`docs/architecture/decisions/`](./docs/architecture/decisions/).

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes_tool` or `query_graph_tool` instead of Grep
- **Understanding impact**: `get_impact_radius_tool` instead of manually tracing imports
- **Code review**: `detect_changes_tool` + `get_review_context_tool` instead of reading entire files
- **Finding relationships**: `query_graph_tool` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview_tool` + `list_communities_tool`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
| ------ | ---------- |
| `detect_changes_tool` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context_tool` | Need source snippets for review — token-efficient |
| `get_impact_radius_tool` | Understanding blast radius of a change |
| `get_affected_flows_tool` | Finding which execution paths are impacted |
| `query_graph_tool` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes_tool` | Finding functions/classes by name or keyword |
| `get_architecture_overview_tool` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes_tool` for code review.
3. Use `get_affected_flows_tool` to understand impact.
4. Use `query_graph_tool` pattern="tests_for" to check coverage.
