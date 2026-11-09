import type { Metadata } from "next";
import { RULES_AS_OF, SOURCES } from "@/lib/jlpt";
import { DISCLAIMER_SHORT, HONESTY } from "@/lib/site";

export const metadata: Metadata = { title: "Disclaimer", description: DISCLAIMER_SHORT };

export default function DisclaimerPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <p className="font-mono text-[11px] tracking-[0.28em] text-amber uppercase">Read this</p>
      <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">Disclaimer</h1>
      <p className="mt-4 text-lg text-foreground">{DISCLAIMER_SHORT}</p>
      <p className="mt-2 text-muted">{HONESTY}</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-base font-semibold text-foreground">What this is</h2>
          <p className="mt-2">
            A free educational checker. It applies a dated reading (as of {RULES_AS_OF}) of JLPT&apos;s official &quot;Advantages of JLPT&quot; page and CEFR reference table, and of the Immigration Services Agency&apos;s pages on HSP points, Designated Activities 46, the Business Manager revision of 2025-10-16, Specified Skilled Worker fields, 育成就労 (from 2027-04-01) and the permanent-residence guideline revised on 2026-10-01, to the level and facts you enter.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">What it is not</h2>
          <p className="mt-2">
            It is not immigration, legal or career advice and is not affiliated with the Immigration Services Agency of Japan, the Ministry of Justice, the Japan Foundation, JEES or any ministry. It does not decide any application. Language is only one condition of each status; other requirements (job, income, skills tests, school admission) still apply. Some rules (permanent residence B1) are factors ISA weighs, not pass/fail tests, and ISA has not yet said which certificates prove B1. ISA decides; confirm with ISA&apos;s information centre (0570-013904), your school or employer, or a licensed gyoseishoshi / lawyer.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">How levels are compared</h2>
          <p className="mt-2">
            A pass at a higher JLPT level counts for every lower-level rule. CEFR levels come from JLPT&apos;s own reference display (N1 142+ = C1, N1 100–141 = B2, N2 112+ = B2, N2 90–111 = B1, N3 104+ = B1, N3 95–103 = A2, N4 = A2, N5 = A1); it covers language knowledge, reading and listening only. A score below the pass mark is treated as no pass at that level.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {SOURCES.map((s) => (
              <li key={s}>
                <a href={s} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
