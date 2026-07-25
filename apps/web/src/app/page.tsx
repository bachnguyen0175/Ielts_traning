import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { StatStrip } from "@/components/landing/stat-strip";
import { Problem } from "@/components/landing/problem";
import { Conditions } from "@/components/landing/conditions";
import { Experience } from "@/components/landing/experience";
import { Skills } from "@/components/landing/skills";
import { FinalCta } from "@/components/landing/final-cta";
import { SiteFooter } from "@/components/landing/site-footer";

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <StatStrip />
        <Problem />
        <Conditions />
        <Experience />
        <Skills />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
