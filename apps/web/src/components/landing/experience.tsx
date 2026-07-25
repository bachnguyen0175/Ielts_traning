import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ExamMock } from "./exam-mock";

export function Experience() {
  return (
    <section className="border-y border-border/60 bg-card/40 py-24">
      <Container className="grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <ExamMock variant="listening" />
        </Reveal>
        <Reveal className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-foreground/70 dark:text-accent">
            The experience
          </p>
          <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            The exam, faithfully rebuilt.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Every detail is tuned to feel like the day itself — the running clock,
            the single-play recording, the review screen you return to when time
            is tight. When the real test comes, none of it is new.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              "No feedback until you submit — just like the real thing",
              "Answers auto-saved as you go",
              "A results screen that reads like a score report",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-foreground">
                <Check />
                <span className="text-[15px] leading-relaxed text-muted-foreground">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}

function Check() {
  return (
    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/20 text-accent-foreground">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3 w-3"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}
