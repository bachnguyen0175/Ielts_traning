"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/landing/wordmark";
import { AccountControl } from "@/components/auth/account-control";
import { cx } from "@/lib/cx";
import {
  HomeIcon,
  LibraryIcon,
  ChartIcon,
  CardsIcon,
} from "@/components/ui/icons";

// Five is the practical ceiling for a bottom bar before targets get cramped
// (ux-guidelines: Navigation / Bottom Nav Limit). Four leaves room for the
// account control.
const LINKS = [
  { href: "/dashboard", label: "Dashboard", Icon: HomeIcon },
  { href: "/tests", label: "Tests", Icon: LibraryIcon },
  { href: "/progress", label: "Progress", Icon: ChartIcon },
  { href: "/vocab", label: "Vocabulary", Icon: CardsIcon },
] as const;

function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav() {
  const isActive = useIsActive();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Wordmark />
            <nav aria-label="Main" className="hidden md:block">
              <ul className="flex items-center gap-1">
                {LINKS.map(({ href, label }) => {
                  const active = isActive(href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={cx(
                          "relative block rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200",
                          active
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {label}
                        {active && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-x-3.5 -bottom-[1.35rem] h-0.5 rounded-full bg-accent"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
          <AccountControl />
        </Container>
      </header>

      {/* Mobile: the same destinations as a thumb-reachable bottom bar. */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <ul className="mx-auto flex max-w-md items-stretch">
          {LINKS.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  // 44px minimum touch target (ux-guidelines: Touch & Interaction).
                  className={cx(
                    "flex min-h-[3.5rem] flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors duration-200",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cx("h-5 w-5", active && "text-accent")}
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
