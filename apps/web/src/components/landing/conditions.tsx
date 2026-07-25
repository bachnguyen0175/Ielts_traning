import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import type { ReactNode } from "react";

const CONDITIONS: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: "Audio plays once",
    body: "Exactly like the real Listening test. No pause, no rewind, no second chance to catch the answer.",
    icon: <IconSound />,
  },
  {
    title: "Real timing, enforced",
    body: "Section timers match the official test and never stop. The clock isn't a suggestion — it's the exam.",
    icon: <IconClock />,
  },
  {
    title: "The full sitting",
    body: "Listening, Reading and Writing back-to-back — the endurance the real day quietly demands of you.",
    icon: <IconStack />,
  },
  {
    title: "The exam interface",
    body: "Highlighting, review flags and question navigation — the computer-delivered tools you'll actually use.",
    icon: <IconCursor />,
  },
];

export function Conditions() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-24">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-foreground/70 dark:text-accent">
            How it works
          </p>
          <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            Practice that behaves like the real exam
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            We don&rsquo;t just show you questions. We rebuild the conditions that
            decide your score.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CONDITIONS.map((c, i) => (
            <Reveal
              as="div"
              key={c.title}
              delayMs={i * 80}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl hover:shadow-primary/10"
            >
              {/* hover accent hairline */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-accent to-primary transition-transform duration-300 group-hover:scale-x-100"
              />
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary transition-colors group-hover:from-accent/25 group-hover:to-primary/20">
                {c.icon}
              </div>
              <h3 className="mt-5 font-serif text-xl font-semibold tracking-tight text-foreground">
                {c.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {c.body}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function IconBase({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
function IconSound() {
  return (
    <IconBase>
      <path d="M11 5 6 9H3v6h3l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19 5a9 9 0 0 1 0 14" />
    </IconBase>
  );
}
function IconClock() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </IconBase>
  );
}
function IconStack() {
  return (
    <IconBase>
      <path d="m12 3 9 5-9 5-9-5 9-5z" />
      <path d="m3 13 9 5 9-5" />
    </IconBase>
  );
}
function IconCursor() {
  return (
    <IconBase>
      <path d="M4 4l7 16 2-6 6-2z" />
    </IconBase>
  );
}
