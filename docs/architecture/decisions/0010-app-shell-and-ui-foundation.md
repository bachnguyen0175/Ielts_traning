# ADR-0010: App shell and UI foundation

> Status: Accepted
> Date: 2026-08-14

## Context

The app reached eleven screens with no shared chrome and no navigation.

Every page rebuilt the same header inline: a `<main>`, a bordered `div`, a
`Container`, a `Wordmark`, and an `AccountControl`. Ten near-identical copies,
differing only in whether the account control was present.

Navigation did not exist. A signed-in user sitting on `/vocab` could reach
another screen only by editing the URL or returning to the dashboard, whose
shortcut cards were the sole links between screens. The dashboard was load
bearing for routing, which is not a job a dashboard should have.

`components/ui/` held four primitives: `Button`, `Container`, `Reveal`, and
`CountUp`. Everything else was written per screen. Cards appeared as
`rounded-2xl border border-border bg-card p-5` with small unexplained
variations. Empty states were ad-hoc bordered paragraphs. Form fields shared a
`fieldClass` string that had been copy-pasted between onboarding and account and
had already drifted apart.

Two things followed from that. Screens diverged from each other, and
accessibility decisions were remade from scratch each time: some fields wired
`htmlFor` and none wired `aria-describedby`, and two components used text glyphs
as icons.

## Decision

Two shells and a set of primitives, in `components/ui/`.

### Shells

Which chrome a screen gets is a fact about the screen, so it is encoded in the
component you pick rather than a flag you pass.

`AppShell` renders a sticky top nav and, below the `md` breakpoint, a bottom
bar with the same four destinations. It is for screens you navigate *between*:
dashboard, tests, import, progress, vocabulary, account, results, and review.

`FocusShell` renders the wordmark and nothing else. It is for screens you move
*through*: `/start`, the pre-test briefing, and the sitting. Navigation is
withheld deliberately. Wandering off mid-flow loses your place, and during an
exam it would break the sitting, which the fidelity rules do not allow.

Both take a `width` from a fixed set (`narrow`, `form`, `content`, `wide`) and
apply it to an element inside `Container`, never to `Container` itself. See the
consequences below for why that distinction matters.

### Primitives

| Primitive | Purpose |
|---|---|
| `Card`, `CardLink`, `CardBody`, `CardHeader`, `CardTitle`, `Eyebrow` | Surfaces, with four tones (`plain`, `raised`, `quiet`, `notice`) |
| `Field`, `FieldInput`, `FieldSelect` | A labelled control with hint and error, wired for screen readers |
| `Badge` | Status, five tones |
| `EmptyState` | A named absence plus the action that fills it |
| `PageHeader` | Eyebrow, title, lead, and optional actions |
| `BandGauge`, `BandTrendChart` | Band scores, shared by the dashboard, results, and progress |
| `icons.tsx` | One drawing style: 24px box, `currentColor`, 1.6 stroke weight |

### Composition rules

Taken from the `vercel-composition-patterns` skill:

- No boolean props that switch behaviour. Where two behaviours exist, there are
  two components. `AppShell` and `FocusShell` are the largest instance of this.
- Children rather than render props. `PageHeader` takes its actions as children.
- Context only where state is genuinely shared. `Field` is the single case: the
  label, control, hint, and error must agree on the same ids for `htmlFor`,
  `aria-describedby`, and `aria-invalid`, and passing those by hand is how
  accessible markup rots. `Card` deliberately has no context, because nothing in
  it is shared state.
- No `forwardRef`. React 19 passes `ref` as an ordinary prop.

## Alternatives considered

**One shell with a `showNav` prop.** Fewer files, and the call sites read
almost the same. Rejected because it is the boolean-prop anti-pattern the
composition rules exist to prevent: the flag would have grown a second one for
the account control, then a third for the bottom bar, and the component would
encode a matrix of chrome that no single screen wants.

**Route group layouts, `(app)/layout.tsx` and `(focus)/layout.tsx`.** This is
the idiomatic App Router answer. It removes the per-page opt-in entirely, and a
new page in the group inherits the chrome without doing anything. Rejected for
now on cost rather than merit: the routes are not arranged to make it cheap.
`/mock` needs the focus shell while `/mock/results` and `/mock/review` need the
full one, so the split requires either a nested group inside `/mock` or moving
results and review out from under it, and both change URLs that the E2E suite
and the results links depend on. This is the most likely thing to supersede this
ADR.

**shadcn/ui.** It would supply most of these primitives with better
accessibility than hand-rolled versions. Rejected because its components arrive
as copied source styled for its own token names, and this project already has an
accepted visual direction with its own tokens
([`design/visual-direction.md`](../../design/visual-direction.md)). Adopting it
means either restyling every component on arrival or bending the tokens toward
shadcn's, and the seven primitives here are small enough that neither is worth
it. Worth revisiting if the app needs dialogs, popovers, or a command palette,
where the accessibility work is genuinely hard.

**Leaving it alone.** Rejected on the navigation gap alone. A public product
where the only route between screens is the dashboard is not shippable.

## Consequences

Ten copies of the header collapse into one, and the app has navigation for the
first time.

Every screen opts in explicitly by choosing a shell. A new page that forgets
gets no nav and no gutter, and nothing warns you. The route-group alternative
above is the fix if this becomes a recurring mistake.

**A trap this introduced, and the fix.** The first version passed the width
straight to `Container`, which hard-codes `max-w-6xl`. Two competing `max-w`
utilities on one element resolve by stylesheet order, not by the order you
passed them, so `max-w-6xl` always won and every screen in the app rendered at
full width. Types, lint, 133 unit tests, and 20 E2E specs all passed. The width
now goes on a nested element, and any future primitive that accepts a
`className` has the same hazard.

**Rendering the screens found four other defects that the suites did not.** The
band trend chart clamped any band below 4 onto the "4" gridline, drawing a score
the user did not get. The review screen's wrong-answer mark used
`bg-destructive`, a token this theme never defined, so it had been rendering
with no background. The reading passage, the longest text in the product, was
muted grey on grey. The speaking recorder's pulse ignored
`prefers-reduced-motion`, against a rule the visual direction calls
non-negotiable. This is the
strongest argument in the ADR for the screenshot step in the playbook.

**A new untested surface.** The shells, `Field`, `BandGauge`, `BandTrendChart`,
`AppNav`, and the import client have no unit tests. The existing suites cover
the screens that compose them, which is how the width bug survived.

**The dashboard is a deliberate exception.** Its design was settled in the
previous phase and is unchanged here. It adopted the shell only, because leaving
it as the one screen without navigation would have defeated the point.

**Follow-ups**

1. Add component tests for `Field` (id wiring), `BandTrendChart` (domain
   derivation, including bands below 4), and the shells (width application).
2. Revisit route groups once the `/mock` URL layout is settled.
3. Decide whether `Reveal` and `CountUp`, both landing-page era, still earn a
   place beside `.enter`.
