import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ExamMock } from "./exam-mock";

function step(i: number): CSSProperties {
  return { ["--i" as string]: i };
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* atmosphere */}
      <div aria-hidden="true" className="aurora" />
      <div aria-hidden="true" className="grain" />

      <Container className="grid items-center gap-14 pb-24 pt-16 md:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:pb-32">
        <div className="max-w-xl">
          <span
            className="enter inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
            style={step(0)}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            IELTS Academic · Full mock exams
          </span>

          <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.03] tracking-tight text-foreground sm:text-6xl">
            <span className="enter block" style={step(1)}>
              Sit the real test
            </span>
            <span className="enter block" style={step(2)}>
              <em className="text-gradient font-semibold not-italic">before</em>{" "}
              test day.
            </span>
          </h1>

          <p
            className="enter mt-6 text-lg leading-relaxed text-muted-foreground"
            style={step(3)}
          >
            Composed recreates authentic IELTS exam conditions — play-once audio,
            unforgiving timing, the full two-hour-forty-five sitting — so you
            rehearse the pressure, not just the content.
          </p>

          <div
            className="enter mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={step(4)}
          >
            <Button href="/start" variant="accent" size="lg">
              Start a free mock
            </Button>
            <Button href="#how-it-works" variant="outline" size="lg">
              See how it works
            </Button>
          </div>

          <p className="enter mt-5 text-sm text-muted-foreground" style={step(5)}>
            Free to start · No credit card · A complete Academic mock
          </p>
        </div>

        <div className="enter relative" style={step(3)}>
          {/* glow behind the mock */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] opacity-70 blur-2xl"
            style={{
              background:
                "radial-gradient(60% 60% at 60% 30%, hsl(var(--accent) / 0.35), transparent 70%), radial-gradient(60% 60% at 30% 80%, hsl(var(--primary) / 0.35), transparent 70%)",
            }}
          />
          <div className="animate-float">
            <ExamMock variant="reading" />
          </div>

          {/* floating band-score chip */}
          <div
            aria-hidden="true"
            className="animate-float absolute -bottom-5 -left-4 flex items-center gap-3 rounded-2xl border border-border bg-card/90 px-4 py-3 shadow-xl shadow-primary/10 backdrop-blur sm:-left-8"
            style={{ animationDelay: "1.4s" }}
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
              <span className="font-serif text-lg font-semibold">7.5</span>
            </div>
            <div className="pr-1">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Overall band
              </div>
              <div className="text-sm font-semibold text-foreground">
                Reading 8.0 · Listening 7.5
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
