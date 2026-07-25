import { Container } from "@/components/ui/container";
import { Wordmark } from "./wordmark";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-card/40 py-14">
      <Container>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Wordmark />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Authentic IELTS Academic practice. Rehearse the pressure, not just
              the content.
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
            <a
              href="#how-it-works"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="#skills"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              The skills
            </a>
          </nav>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
          <p>
            Not affiliated with or endorsed by the IELTS partners (British
            Council, IDP&nbsp;IELTS, or Cambridge Assessment&nbsp;English).
            &ldquo;IELTS&rdquo; is a trademark of its respective owners.
          </p>
          <p className="mt-3">© {year} Composed. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
