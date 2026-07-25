import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export function Problem() {
  return (
    <section className="border-y border-border/60 bg-card/40 py-24">
      <Container>
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-foreground/70 dark:text-accent">
            The real problem
          </p>
          <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            You know the material. Test day still wins.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Most candidates don&rsquo;t fall short on knowledge — they{" "}
            <span className="text-foreground">freeze</span>. Single-play audio, a
            clock that never stops, an unfamiliar screen, and nearly three hours
            of sustained focus. Practice that skips those conditions leaves the
            hardest part of the exam completely unrehearsed.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
