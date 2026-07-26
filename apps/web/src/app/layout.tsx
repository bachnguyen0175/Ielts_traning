import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ielts-training.example"),
  title: {
    default: "Composed — Sit IELTS under real test-day conditions",
    template: "%s · Composed",
  },
  description:
    "An IELTS Academic practice platform that recreates authentic test-day conditions — play-once audio, real timing, the full sitting — so you rehearse the pressure, not just the content.",
  openGraph: {
    title: "Composed — Sit IELTS under real test-day conditions",
    description:
      "Rehearse the pressure, not just the content. Authentic full IELTS Academic mocks.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // <html>/<body> attributes are commonly mutated before hydration by
      // browser extensions (and, later, a theme script). Our className here is
      // deterministic, so suppress warnings at this single level only.
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
