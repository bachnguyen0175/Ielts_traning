import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { AccountMenu } from "@/components/auth/account-menu";
import { Wordmark } from "./wordmark";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Wordmark />
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Primary">
          <a
            href="#how-it-works"
            className="hidden rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
          >
            How it works
          </a>
          <a
            href="#skills"
            className="hidden rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
          >
            The skills
          </a>
          <AccountMenu />
          <Button href="/start" variant="accent" size="md">
            Start a free mock
          </Button>
        </nav>
      </Container>
    </header>
  );
}
