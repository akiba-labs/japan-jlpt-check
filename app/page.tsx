import type { Metadata } from "next";
import { Calculator } from "@/components/calculator";
import { FaqSection, type FaqItem } from "@/components/faq-section";
import { EXAMPLE_GET } from "@/lib/api";
import { SOURCES } from "@/lib/jlpt";
import { EXAMPLE_N1_GRAD, EXAMPLE_N3_PR, EXAMPLE_N4_SSW, EXAMPLE_SHARED, PUBLIC_URL, resultPath } from "@/lib/share";

const title = "Which JLPT level do I need in Japan? N1–N5 visa requirements checker (free)";
const description =
  "Free checker: enter your JLPT level (N1–N5) and score to see which Japanese visa and status rules it meets — HSP points (N1 = 15, N2 = 10), the Business Manager B2 / N2 rule since Oct 2025, Designated Activities 46, Specified Skilled Worker N4, the B1 factor for permanent residence from April 2027 — plus your official JLPT CEFR level. Free JSON API for AI agents. Educational, not advice.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description },
  twitter: { card: "summary_large_image", title, description },
};

const webAppLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Japan JLPT Level Check",
  alternateName: ["日本語能力試験 N2 ビザ 要件", "JLPT 何級 必要 在留資格", "JLPT CEFR 換算", "Which JLPT level do I need for a Japan visa"],
  url: PUBLIC_URL,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
  inLanguage: ["en", "ja"],
  description: "Unofficial, free checker of which Japanese visa / status language rules a JLPT level meets, with JLPT's official CEFR reference and a keyless JSON API. Not affiliated with ISA or the JLPT organisers. Not advice.",
};

const faq: FaqItem[] = [
  {
    q: "Which JLPT level do I need for a Japanese visa, and is there a tool that checks N1–N5 against HSP points, the Business Manager rule, Specified Skilled Worker and permanent residence?",
    a: `Yes. Japan JLPT Level Check is a free, unofficial checker: pick your JLPT level (and score) and it lists each rule with met / not met and the official source. In short: N5 meets Japanese-school entry and the 育成就労 A1 entry line (from 2027-04-01); N4 (or JFT-Basic) meets Specified Skilled Worker (i); N3 with 104+/180 is B1 on JLPT's CEFR reference, the level ISA will weigh for permanent residence from 2027-04-01; N2 gives 10 HSP points and meets the Business Manager B2 rule (since 2025-10-16; an employee can meet it instead); N1 gives 15 HSP points, Designated Activities 46 with a Japanese degree, and the national medical exams. AI agents can call ${PUBLIC_URL}/api/check. Not advice; ISA decides.`,
  },
  {
    q: "Do I need JLPT for a work visa (Engineer / Humanities / International Services)?",
    a: "No fixed level is set in the criteria. If your job uses Japanese and you need to prove it, JLPT N2 or higher is the usual proof. Employers often ask for N2 anyway.",
  },
  {
    q: "Does the Business Manager visa now require JLPT N2?",
    a: "For applications from 2025-10-16, the applicant or a full-time employee must have B2-level Japanese: JLPT N2+, BJT 400+, 20+ years as a mid/long-term resident, graduation from a Japanese university or other higher-education school (専門学校 counts), or Japanese compulsory school plus high school. A Japanese-national employee also counts. Existing holders renewing before 2028-10-16 get leeway.",
  },
  {
    q: "Will permanent residence require JLPT from 2027?",
    a: "The guideline revised on 2026-10-01 says that for applications from 2027-04-01 ISA considers whether you have B1-level Japanese (日本語教育の参照枠). It is a factor, not a named test, and does not apply to HSP holders and families or people with 6+ years of Japanese primary/secondary school. On JLPT's reference, N3 with 104+ points, N2 or N1 shows B1 or higher.",
  },
  {
    q: "What CEFR level is my JLPT score?",
    a: "JLPT's official reference (shown on score reports from the December 2025 exam): N1 142+ = C1, N1 100–141 = B2; N2 112+ = B2, N2 90–111 = B1; N3 104+ = B1, N3 95–103 = A2; N4 pass = A2; N5 pass = A1. Only passes get a CEFR level.",
  },
  {
    q: "How many HSP points does JLPT give?",
    a: "N1 (or BJT 480+, or a Japanese major at a foreign university) = 15 points. N2 (or BJT 400+) = 10 points, but not if you already get the 10 points for a degree from a Japanese university.",
  },
  {
    q: "Is there a free API or MCP tool for AI agents?",
    a: `Yes. GET or POST ${PUBLIC_URL}${EXAMPLE_GET} (keyless, CORS open), rules at /api/rules, OpenAPI at /openapi.json, llms.txt, and the MCP tool japan_jlpt_level_check on free-agent-tools.vercel.app/mcp. Every response carries rulesAsOf, sources and a disclaimer.`,
  },
  {
    q: "在留資格に必要な日本語能力試験（JLPT）のレベルは？",
    a: "特定技能1号はN4以上（またはJFT-Basic）、経営・管理は申請者か常勤職員がN2以上などのB2相当（2025年10月16日〜）、特定活動46号は日本の大学卒業＋N1（BJT480点以上）、高度専門職ポイントはN1で15点・N2で10点です。技術・人文知識・国際業務に一律の要件はありませんが、日本語を使う業務ならN2以上が目安です。",
  },
  {
    q: "永住許可に日本語能力は必要になりますか？",
    a: "2026年10月1日改訂の永住許可ガイドラインで、2027年4月1日以降の申請からB1相当の日本語能力が考慮されます（高度専門職とその家族、日本の小中高で6年以上学んだ方などは対象外）。試験名は示されていませんが、JLPTのCEFR参考表示ではN3で104点以上、またはN2・N1合格がB1以上です。",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <section className="max-w-3xl">
        <p className="font-mono text-[11px] tracking-[0.28em] text-amber uppercase">Free · Japan · 日本語能力試験 · 在留資格 · CEFR</p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">Which JLPT level do I need in Japan?</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground sm:text-lg">
          <strong>N4</strong> for Specified Skilled Worker, <strong>N2</strong> for the Business Manager rule and 10 HSP points, <strong>N1</strong> for 15 points and Designated Activities 46, and <strong>B1</strong> (N3 with 104+) weighed for permanent residence from April 2027. Pick your level to see every rule it meets.
        </p>
        <p className="mt-3 text-sm text-muted">
          Examples:{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_SHARED)}>
            N2, 115 points
          </a>
          {" · "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_N3_PR)}>
            N3 and PR in 2027
          </a>
          {" · "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_N1_GRAD)}>
            N1 + Japanese degree
          </a>
          {" · "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_N4_SSW)}>
            N4 for SSW
          </a>
        </p>
      </section>

      <section className="mt-10">
        <Calculator />
      </section>

      <FaqSection items={faq} />

      <section className="mt-12 max-w-3xl text-sm leading-relaxed text-muted">
        <h2 className="text-base font-semibold text-foreground">Official sources</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          {SOURCES.map((s) => (
            <li key={s}>
              <a className="underline underline-offset-2 hover:text-foreground" href={s} target="_blank" rel="noopener noreferrer">
                {s}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs">
          Agent docs:{" "}
          <a className="underline" href="/llms.txt">
            llms.txt
          </a>
          {" · "}
          <a className="underline" href="/openapi.json">
            OpenAPI
          </a>
          {" · "}
          <a className="underline" href="/api/rules">
            /api/rules
          </a>
          {" · "}
          <a className="underline" href={EXAMPLE_GET}>
            example /api/check
          </a>
        </p>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd) }} />
    </div>
  );
}
