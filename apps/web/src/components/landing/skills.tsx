import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

const SKILLS: { name: string; detail: string; meta: string }[] = [
  { name: "Listening", detail: "Four parts, played once.", meta: "~30 min · 40 questions" },
  { name: "Reading", detail: "Three academic passages.", meta: "60 min · 40 questions" },
  { name: "Writing", detail: "Two tasks, the real 20/40 split.", meta: "60 min · 2 tasks" },
  { name: "Speaking", detail: "Three-part format, recorded for review.", meta: "11–14 min · 3 parts" },
];

export function Skills() {
  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="scroll-mt-20 py-24"
    >
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-foreground/70 dark:text-accent">
            One complete mock
          </p>
          <h2
            id="skills-heading"
            className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl"
          >
            All four skills, one authentic sitting
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SKILLS.map((s, i) => (
            <Reveal
              as="div"
              key={s.name}
              delayMs={i * 80}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
              />
              <span className="font-mono text-xs font-semibold text-accent-foreground/60 dark:text-accent">
                0{i + 1}
              </span>
              <h3 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-foreground">
                {s.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.detail}
              </p>
              <p className="mt-4 border-t border-border pt-3 text-xs font-medium text-muted-foreground">
                {s.meta}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
