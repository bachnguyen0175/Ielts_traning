import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export function FinalCta() {
  return (
    <section className="py-24">
      <Container>
        <Reveal className="relative overflow-hidden rounded-3xl border border-border bg-primary px-6 py-16 text-center sm:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 90% at 50% -10%, hsl(var(--accent) / 0.28), transparent 60%)",
            }}
          />
          <div
            aria-hidden="true"
            className="animate-float pointer-events-none absolute -right-10 top-1/3 h-40 w-40 rounded-full bg-accent/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="grain opacity-20"
            style={{ zIndex: 0 }}
          />
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-primary-foreground sm:text-5xl">
              Find out how ready you really are.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-primary-foreground/75">
              Take a full Academic mock under real conditions. No shortcuts, no
              illusions — an honest measure, and a place to get better.
            </p>
            <div className="mt-9 flex justify-center">
              <Button href="/start" variant="accent" size="lg">
                Start a free mock
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
