import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { CountUp } from "@/components/ui/count-up";

const STATS: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
}[] = [
  { to: 4, label: "skills in one sitting" },
  { to: 80, suffix: "+", label: "questions auto-scored" },
  { to: 165, label: "minutes, no breaks" },
  { to: 9, decimals: 1, label: "band scale, the real one" },
];

export function StatStrip() {
  return (
    <section aria-label="By the numbers" className="relative">
      <Container>
        <Reveal className="-mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border/60 shadow-xl shadow-primary/5 md:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="bg-card px-6 py-8 text-center sm:px-8"
            >
              <div className="font-serif text-4xl font-semibold tracking-tight text-foreground tabular-nums sm:text-5xl">
                {s.prefix}
                <CountUp
                  to={s.to}
                  decimals={s.decimals}
                  className="text-gradient"
                />
                {s.suffix}
              </div>
              <div className="mt-2 text-sm leading-snug text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
