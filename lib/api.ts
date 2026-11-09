import { InputError, type Endpoint, type Input } from "./agent-api";
import { DISCLAIMER, LEVELS, RULES_AS_OF, RuleInputError, checkJlpt, type Level } from "./jlpt";
import { SITE_NAME, SITE_TAGLINE } from "./site";

export const PUBLIC_URL = "https://japan-jlpt-check.vercel.app";
export const API_DISCLAIMER = DISCLAIMER;
export const API_INFO = { title: `${SITE_NAME} API`, description: SITE_TAGLINE, version: "1.0.0" };

export const EXAMPLE_GET = "/api/check?level=n2&score=115";

function first(v: unknown): unknown {
  return Array.isArray(v) ? v[0] : v;
}
function s(v: unknown): string | null {
  const f = first(v);
  return f === undefined || f === null || String(f).trim() === "" ? null : String(f).trim();
}
function tb(v: unknown, name: string): boolean | undefined {
  const f = first(v);
  if (typeof f === "boolean") return f;
  if (f === undefined || f === null || String(f).trim() === "") return undefined;
  const t = String(f).trim();
  if (/^(1|true|yes|y|on|はい)$/i.test(t)) return true;
  if (/^(0|false|no|n|off|いいえ)$/i.test(t)) return false;
  throw new InputError(`${name} must be true or false`);
}
function n(v: unknown, name: string): number | null {
  const f = s(v);
  if (f === null) return null;
  const x = Number(f.replace(/[,点年 ]|years?|pts?|points?/gi, ""));
  if (!Number.isFinite(x)) throw new InputError(`${name} must be a number`);
  return x;
}

/** Accepts n2, N2, 2, "jlpt n2", "JLPT N2", 日本語能力試験N2, ｎ２, none, なし. */
export function parseLevel(raw: string | null): Level | undefined {
  if (raw === null) return undefined;
  const t = raw
    .normalize("NFKC")
    .toLowerCase()
    .replace(/日本語能力試験|jlpt|level|レベル|級|合格|\s|-|_/g, "");
  if (/^(none|no|0|なし|無し|未受験|nothing)$/.test(t)) return "none";
  const m = t.match(/^n?([1-5])$/);
  if (m) return `n${m[1]}` as Level;
  throw new InputError(`Invalid level "${raw}". Allowed: ${LEVELS.join(", ")} (also N2, 2, JLPT N2, 日本語能力試験N2)`);
}

export function computeCheck(input: Input) {
  try {
    return checkJlpt({
      level: parseLevel(s(input.level ?? input.jlpt ?? input.jlptLevel ?? input.n ?? input.レベル)),
      score: n(input.score ?? input.totalScore ?? input.jlptScore ?? input.総合得点, "score"),
      bjtScore: n(input.bjtScore ?? input.bjt, "bjtScore"),
      japaneseDegree: tb(input.japaneseDegree ?? input.japanDegree ?? input.degreeJapan, "japaneseDegree"),
      japaneseHigherEd: tb(input.japaneseHigherEd ?? input.senmon ?? input.japaneseVocationalSchool, "japaneseHigherEd"),
      japaneseMajorAbroad: tb(input.japaneseMajorAbroad ?? input.japaneseMajor, "japaneseMajorAbroad"),
      japaneseHighSchool: tb(input.japaneseHighSchool ?? input.highSchoolJapan, "japaneseHighSchool"),
      japaneseSchooling6y: tb(input.japaneseSchooling6y ?? input.schooling6y, "japaneseSchooling6y"),
      yearsInJapan: n(input.yearsInJapan ?? input.years, "yearsInJapan"),
      jftBasic: tb(input.jftBasic ?? input.jft, "jftBasic"),
      titp2: tb(input.titp2 ?? input.technicalIntern2, "titp2"),
      titp2Care: tb(input.titp2Care, "titp2Care"),
      careJapaneseTest: tb(input.careJapaneseTest ?? input.careTest, "careJapaneseTest"),
      hsp: tb(input.hsp ?? input.hspHolder, "hsp"),
      applyDate: s(input.applyDate ?? input.applicationDate),
      today: s(input.today),
    });
  } catch (e) {
    if (e instanceof RuleInputError) throw new InputError(e.message);
    throw e;
  }
}

const bool = (name: string, description: string) => ({ name, type: "boolean" as const, default: false, description });

export const ENDPOINTS: Record<"check", Endpoint> = {
  check: {
    path: "/api/check",
    operationId: "japanJlptLevelCheck",
    summary: "Which JLPT level do I need in Japan? Visa / status Japanese requirements a level meets",
    description: `Compares a JLPT level (N1–N5, optional total score) plus optional BJT score / Japanese degree facts with Japan's published Japanese-language rules (as of ${RULES_AS_OF}): HSP points (N1/BJT480 = 15, N2/BJT400 = 10, not with a Japanese degree), Designated Activities 46 (Japanese degree + N1/BJT480), Business Manager B2 rule since 2025-10-16 (applicant or a full-time employee: N2+, BJT400+, 20 years, Japanese higher-ed or school), SSW (i) (N4 or JFT-Basic; TITP (ii) exempt; care adds the care Japanese test), SSW (ii) food service / fishery B1 from 2027-04-01, 育成就労 A1 entry from 2027-04-01, permanent-residence B1 factor for applications from 2027-04-01, Japanese-school / university benchmarks, N1 for national medical exams, and EPA lines. Uses JLPT's official CEFR reference (e.g. N3 104+ = B1, N2 112+ = B2, N1 142+ = C1). Returns verdict (b2_plus | b1 | a2 | a1 | none), summary, cefr, hspPoints, items[] with status (met | not_met | exempt | points | considered_met | considered_unclear | considered_not_met | not_considered | not_in_force_yet | not_required | check_rules), nextLevelUnlocks, sources, disclaimer.`,
    params: [
      { name: "level", type: "string", enum: LEVELS, default: "none", description: "Highest JLPT level passed: n1 … n5 or none. Aliases: N2, 2, JLPT N2, 日本語能力試験N2, なし." },
      { name: "score", type: "number", description: "Optional total score (総合得点, 0–180) on that level, for the CEFR reference (N3 104+ = B1)." },
      { name: "bjtScore", type: "number", description: "Optional BJT Business Japanese score (400+ / 480+ count for HSP, BM, 46号)." },
      bool("japaneseDegree", "Graduated from a Japanese university or graduate school."),
      bool("japaneseHigherEd", "Graduated from another Japanese higher-education school (専門学校, 高専, junior college)."),
      bool("japaneseMajorAbroad", "Majored in Japanese at a foreign university."),
      bool("japaneseHighSchool", "Completed Japanese compulsory education and graduated from a Japanese high school."),
      bool("japaneseSchooling6y", "6+ years of primary / secondary school in Japan (PR B1 not considered)."),
      { name: "yearsInJapan", type: "number", description: "Years living in Japan as a mid/long-term resident (20+ meets the Business Manager B2 rule)." },
      bool("jftBasic", "Passed JFT-Basic (A2)."),
      bool("titp2", "Completed Technical Intern Training (ii) in good standing."),
      bool("titp2Care", "That TITP (ii) was in nursing care."),
      bool("careJapaneseTest", "Passed the Care Japanese Language Evaluation Test (介護日本語評価試験)."),
      bool("hsp", "You hold HSP status or are an HSP family member (PR B1 not considered)."),
      { name: "applyDate", type: "string", description: "YYYY-MM-DD planned application date (default today); rules starting 2027-04-01 apply only from then." },
      { name: "today", type: "string", description: "Override today's date (default: today in Japan)." },
    ],
    example: EXAMPLE_GET,
    compute: computeCheck,
  },
};

export const PLUGIN = {
  name: "Japan JLPT Level Check",
  nameForModel: "japan_jlpt_level_check",
  descriptionForHuman: "Which JLPT level do I need in Japan? See which visa and status Japanese rules your level meets.",
  descriptionForModel:
    "Use when someone asks which JLPT level (N1–N5) they need for a Japanese visa or status, what N2 or N1 gives them (HSP points, Business Manager B2 rule from 2025-10-16, Designated Activities 46, Specified Skilled Worker N4, permanent-residence B1 factor from 2027-04-01, 育成就労 A1), what CEFR level their JLPT score maps to (JLPT's official reference), or what the next level would unlock. Computes from dated official rules instead of guessing; relay the disclaimer (educational; ISA decides).",
  logo: "/icon.svg",
};
