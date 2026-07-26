import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// AccountMenu (in the header) uses useSession; its provider lives in the layout,
// not in this isolated page render — stub the client auth hooks.
vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import Page from "./page";

/**
 * Landing page spec — derived from docs/features/landing-page.md.
 * Asserts the required sections, the value-prop content, accessible landmarks,
 * and that primary CTAs point at the start flow.
 */
describe("Landing page", () => {
  it("has a single H1 that states the core promise", () => {
    render(<Page />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(/test/i);
  });

  it("renders the three landmark regions (banner, main, contentinfo)", () => {
    render(<Page />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("shows the brand name in the header", () => {
    render(<Page />);
    const banner = screen.getByRole("banner");
    expect(within(banner).getByText(/composed/i)).toBeInTheDocument();
  });

  it("communicates the differentiator: play-once audio, real timing, full sitting", () => {
    render(<Page />);
    // These differentiator phrases legitimately recur across hero + sections.
    expect(screen.getAllByText(/plays once/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/timing/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/full sitting/i).length).toBeGreaterThanOrEqual(1);
  });

  it("names the problem it solves", () => {
    render(<Page />);
    // The 'prepared but underperform' framing
    expect(screen.getByText(/freeze/i)).toBeInTheDocument();
  });

  it("lists all four IELTS skills", () => {
    render(<Page />);
    const skills = screen.getByRole("region", { name: /skills/i });
    for (const skill of ["Listening", "Reading", "Writing", "Speaking"]) {
      expect(within(skills).getByText(skill)).toBeInTheDocument();
    }
  });

  it("has primary CTAs that lead to the start flow", () => {
    render(<Page />);
    const ctas = screen.getAllByRole("link", { name: /start a free mock/i });
    expect(ctas.length).toBeGreaterThanOrEqual(1);
    for (const cta of ctas) {
      expect(cta).toHaveAttribute("href", "/start");
    }
  });

  it("carries an honest non-affiliation disclaimer in the footer", () => {
    render(<Page />);
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByText(/not affiliated/i)).toBeInTheDocument();
  });
});
