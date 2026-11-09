// Japan JLPT Level Check: which Japanese-language rules in Japan a JLPT level (or BJT score / Japanese degree) meets.
// Educational reading of ISA status pages (経営・管理 2025-10-16 revision, 特定活動46号, 特定技能 field pages,
// 育成就労 Japanese-course page, 永住許可ガイドライン 2026-10-01), the HSP points table, JLPT's "Advantages of JLPT"
// page and JLPT's official CEFR reference table. Not immigration or legal advice.

export const RULES_AS_OF = "2026-11-09";

export const SOURCES = [
  "https://www.jlpt.jp/e/about/merit.html",
  "https://www.jlpt.jp/about/cefr_reference.html",
  "https://www.moj.go.jp/isa/applications/resources/newimmiact_3_evaluate_index.html",
  "https://www.moj.go.jp/isa/applications/status/designatedactivities11.html",
  "https://www.moj.go.jp/isa/applications/resources/10_00237.html",
  "https://www.moj.go.jp/isa/policies/ssw/foodservice.html",
  "https://www.moj.go.jp/isa/policies/ssw/fishery.html",
  "https://www.moj.go.jp/isa/policies/ssw/nursingcare.html",
  "https://www.moj.go.jp/isa/03_00195.html",
  "https://www.moj.go.jp/isa/10_00279.html",
] as const;

export const DISCLAIMER =
  "Educational checker, not immigration, legal or career advice. Not affiliated with the Immigration Services Agency of Japan (ISA), the Ministry of Justice, the Japan Foundation, JEES or any ministry. It compares the level, score and facts you enter with published Japanese-language rules as of the date shown; it cannot see your certificate or decide any application. Requirements change and some are only 'considered' rather than required. ISA (or the ministry running the exam) decides; confirm with ISA's information centre (0570-013904), your school or employer, or a licensed gyoseishoshi / lawyer.";

export const LEVELS = ["n1", "n2", "n3", "n4", "n5", "none"] as const;
export type Level = (typeof LEVELS)[number];
export type Cefr = "C1" | "B2" | "B1" | "A2" | "A1";
export type Verdict = "b2_plus" | "b1" | "a2" | "a1" | "none";
export type Status =
  | "met"
  | "not_met"
  | "exempt"
  | "points"
  | "no_points"
  | "considered_met"
  | "considered_unclear"
  | "considered_not_met"
  | "not_considered"
  | "not_in_force_yet"
  | "not_required"
  | "check_rules";

export class RuleInputError extends Error {}

/** JLPT pass marks (総合得点 out of 180) and the official CEFR reference bands (JLPT, from the Dec 2025 exam). */
export const LEVEL_INFO: Record<Exclude<Level, "none">, { passMark: number; cefr: { from: number; level: Cefr }[] }> = {
  n1: { passMark: 100, cefr: [{ from: 100, level: "B2" }, { from: 142, level: "C1" }] },
  n2: { passMark: 90, cefr: [{ from: 90, level: "B1" }, { from: 112, level: "B2" }] },
  n3: { passMark: 95, cefr: [{ from: 95, level: "A2" }, { from: 104, level: "B1" }] },
  n4: { passMark: 90, cefr: [{ from: 90, level: "A2" }] },
  n5: { passMark: 80, cefr: [{ from: 80, level: "A1" }] },
};

const RANK: Record<Level, number> = { n1: 5, n2: 4, n3: 3, n4: 2, n5: 1, none: 0 };
const CEFR_RANK: Record<Cefr, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };
export const atLeast = (l: Level, min: Exclude<Level, "none">) => RANK[l] >= RANK[min];

export const PR_B1_FROM = "2027-04-01";
export const SSW2_B1_FROM = "2027-04-01";
export const IKUSEI_FROM = "2027-04-01";
export const BM_FROM = "2025-10-16";
export const BM_TRANSITION_END = "2028-10-16";

export type JlptInput = {
  level?: Level | null;
  /** Total score (総合得点, 0-180) on the passed level, for the CEFR reference. */
  score?: number | null;
  bjtScore?: number | null;
  /** Graduated from a Japanese university / graduate school (degree). */
  japaneseDegree?: boolean;
  /** Graduated from a Japanese higher-education school incl. 専門学校 / 高専 (Business Manager rule). */
  japaneseHigherEd?: boolean;
  /** Majored in Japanese at a foreign university (counts as N1 for 46号 and HSP). */
  japaneseMajorAbroad?: boolean;
  /** Completed Japanese compulsory education AND graduated from a Japanese high school. */
  japaneseHighSchool?: boolean;
  /** 6+ years of primary / secondary schooling in Japan (PR B1 not considered). */
  japaneseSchooling6y?: boolean;
  yearsInJapan?: number | null;
  /** Passed JFT-Basic at A2 (A2.2) level. */
  jftBasic?: boolean;
  /** Completed Technical Intern Training (ii) in good standing. */
  titp2?: boolean;
  /** That TITP (ii) was in nursing care. */
  titp2Care?: boolean;
  careJapaneseTest?: boolean;
  /** HSP holder (or HSP family member): PR B1 is not considered. */
  hsp?: boolean;
  /** Date you plan to apply (default today) for rules that start later. */
  applyDate?: string | null;
  today?: string | null;
};

export type Item = {
  id: string;
  name: string;
  nameJa: string;
  kind: "requirement" | "points" | "considered" | "benchmark" | "exam_eligibility";
  status: Status;
  rule: string;
  you: string;
  points?: number;
  inForceFrom?: string;
  source: string;
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;
function validDate(s: string, name: string): string {
  if (!ISO.test(s)) throw new RuleInputError(`${name} must be YYYY-MM-DD`);
  const d = new Date(`${s}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) throw new RuleInputError(`${name} is not a real date: ${s}`);
  return s;
}
export function todayJst(): string {
  return new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
}

/** Official JLPT CEFR reference for a pass; null when no pass or no score and the level spans two bands. */
export function cefrFor(level: Level, score: number | null | undefined): { cefr: Cefr | null; minCefr: Cefr | null; passed: boolean | null; note: string } {
  if (level === "none") return { cefr: null, minCefr: null, passed: null, note: "No JLPT pass entered." };
  const info = LEVEL_INFO[level];
  const lo = info.cefr[0].level;
  if (score == null) {
    const hi = info.cefr[info.cefr.length - 1].level;
    return {
      cefr: info.cefr.length === 1 ? lo : null,
      minCefr: lo,
      passed: true,
      note: info.cefr.length === 1 ? `JLPT shows ${lo} for every ${level.toUpperCase()} pass.` : `A ${level.toUpperCase()} pass shows ${lo}, or ${hi} from ${info.cefr[1].from}/180. Enter your total score to know which.`,
    };
  }
  if (score < info.passMark) return { cefr: null, minCefr: null, passed: false, note: `${score}/180 is below the ${level.toUpperCase()} pass mark (${info.passMark}). JLPT shows no CEFR level without a pass.` };
  let c: Cefr = lo;
  for (const b of info.cefr) if (score >= b.from) c = b.level;
  return { cefr: c, minCefr: c, passed: true, note: `JLPT's reference display for ${level.toUpperCase()} ${score}/180 is ${c} (reading, listening and language knowledge only).` };
}

const S = {
  jlpt: SOURCES[0],
  cefr: SOURCES[1],
  hsp: SOURCES[2],
  da46: SOURCES[3],
  bm: SOURCES[4],
  food: SOURCES[5],
  fish: SOURCES[6],
  care: SOURCES[7],
  ikusei: SOURCES[8],
  pr: SOURCES[9],
};

export function checkJlpt(input: JlptInput) {
  const today = input.today ? validDate(input.today, "today") : todayJst();
  const applyDate = input.applyDate ? validDate(input.applyDate, "applyDate") : today;
  const rawLevel = input.level ?? "none";
  if (!(LEVELS as readonly string[]).includes(rawLevel)) throw new RuleInputError(`level must be one of ${LEVELS.join(", ")}`);
  const score = input.score ?? null;
  if (score != null && (!Number.isFinite(score) || score < 0 || score > 180)) throw new RuleInputError("score must be the JLPT total score, 0 to 180");
  if (score != null && rawLevel === "none") throw new RuleInputError("score needs a level (n1 to n5)");
  const bjt = input.bjtScore ?? null;
  if (bjt != null && (!Number.isFinite(bjt) || bjt < 0 || bjt > 800)) throw new RuleInputError("bjtScore must be 0 to 800");
  const years = input.yearsInJapan ?? null;
  if (years != null && (!Number.isFinite(years) || years < 0 || years > 120)) throw new RuleInputError("yearsInJapan must be 0 to 120");

  const c = cefrFor(rawLevel, score);
  // A failed score means no pass at that level.
  const level: Level = c.passed === false ? "none" : rawLevel;
  const L = level.toUpperCase();
  const deg = !!input.japaneseDegree;
  const higherEd = deg || !!input.japaneseHigherEd;
  const major = !!input.japaneseMajorAbroad;
  const items: Item[] = [];
  const warnings: string[] = [];
  if (c.passed === false) warnings.push(c.note + " Treated as no pass at that level.");

  // 1. HSP points (高度専門職ポイント)
  {
    const n1eq = atLeast(level, "n1") || (bjt != null && bjt >= 480) || major;
    const n2eq = atLeast(level, "n2") || (bjt != null && bjt >= 400);
    let pts = 0;
    let you: string;
    if (n1eq) {
      pts = 15;
      you = `15 points (${atLeast(level, "n1") ? "JLPT N1" : major ? "Japanese major at a foreign university" : `BJT ${bjt}`}).${deg ? " Your Japanese degree adds its own 10." : ""}`;
    } else if (n2eq && deg) {
      pts = 0;
      you = "0 for N2: N2-level points are not given on top of the 10 points for a Japanese degree (the degree's 10 still count). N1 would add 15.";
    } else if (n2eq) {
      pts = 10;
      you = `10 points (${atLeast(level, "n2") ? "JLPT N2" : `BJT ${bjt}`}). N1 (or BJT 480+) would give 15.`;
    } else {
      you = "No Japanese-language points. N2 (or BJT 400+) gives 10, N1 (or BJT 480+) gives 15.";
    }
    items.push({
      id: "hsp_points",
      name: "Highly Skilled Professional points",
      nameJa: "高度専門職ポイント（日本語能力）",
      kind: "points",
      status: pts > 0 ? "points" : "no_points",
      rule: "JLPT N1, BJT 480+ or a Japanese major at a foreign university: 15 points. JLPT N2 or BJT 400+: 10 points, but not for people who already get the 10 points for a Japanese degree. 70 points qualify for HSP.",
      you,
      points: pts,
      source: S.hsp,
    });
  }

  // 2. Designated Activities 46 (本邦大学等卒業者)
  {
    const lang = atLeast(level, "n1") || (bjt != null && bjt >= 480) || major;
    items.push({
      id: "designated_activities_46",
      name: "Designated Activities No. 46 (Japanese-university graduates)",
      nameJa: "特定活動（告示46号・本邦大学等卒業者）",
      kind: "requirement",
      status: lang && deg ? "met" : "not_met",
      rule: "A degree from a Japanese university or graduate school (or the listed equivalents) AND JLPT N1 or BJT 480+ (a Japanese major at a foreign university also proves the language). The job must use Japanese.",
      you: lang && deg ? "Language and degree conditions met (the job and other conditions still apply)." : !lang && !deg ? "Needs both: JLPT N1 / BJT 480+ and a Japanese degree." : !lang ? "Degree yes; needs JLPT N1 or BJT 480+." : "Language yes; needs a degree from a Japanese university or graduate school.",
      source: S.da46,
    });
  }

  // 3. Business Manager (経営・管理) B2 rule from 2025-10-16
  {
    const how: string[] = [];
    if (atLeast(level, "n2")) how.push(`JLPT ${L}`);
    if (bjt != null && bjt >= 400) how.push(`BJT ${bjt}`);
    if (years != null && years >= 20) how.push(`${years} years living in Japan`);
    if (higherEd) how.push("Japanese higher-education graduate");
    if (input.japaneseHighSchool) how.push("Japanese compulsory school + high school");
    const met = how.length > 0;
    items.push({
      id: "business_manager",
      name: "Business Manager visa: B2 Japanese (applicant or a full-time employee)",
      nameJa: "経営・管理（日本語能力 B2相当：申請者又は常勤職員）",
      kind: "requirement",
      status: met ? "met" : "not_met",
      rule: "For applications from 2025-10-16, the applicant OR a full-time employee needs B2-level Japanese: JLPT N2+, BJT 400+, 20+ years as a mid/long-term resident, a Japanese higher-education degree (専門学校 counts), or Japanese compulsory school + high school. A Japanese national employee also counts. Existing holders renewing before 2028-10-16 are judged with leeway.",
      you: met ? `You meet it yourself (${how.join(", ")}).` : "You do not meet it yourself; it is still met if a full-time employee does (for example a Japanese national, or an employee with N2+).",
      inForceFrom: BM_FROM,
      source: S.bm,
    });
  }

  // 4. Specified Skilled Worker (i)
  {
    const met = atLeast(level, "n4") || !!input.jftBasic;
    const exempt = !met && !!input.titp2;
    items.push({
      id: "ssw1",
      name: "Specified Skilled Worker (i), all fields",
      nameJa: "特定技能1号（日本語能力）",
      kind: "requirement",
      status: met ? "met" : exempt ? "exempt" : "not_met",
      rule: "JFT-Basic (A2.2 level) or JLPT N4+. The Japanese test is waived for anyone who completed Technical Intern Training (ii) in good standing, in any job type. The skills test is separate.",
      you: met ? `Met (${atLeast(level, "n4") ? `JLPT ${L}` : "JFT-Basic"}).` : exempt ? "Exempt through Technical Intern Training (ii)." : "Needs JLPT N4 or JFT-Basic.",
      source: S.food,
    });
    const careMet = (met || exempt) && (!!input.careJapaneseTest || !!input.titp2Care);
    items.push({
      id: "ssw1_care",
      name: "Specified Skilled Worker (i), nursing care",
      nameJa: "特定技能1号「介護」（日本語能力）",
      kind: "requirement",
      status: careMet ? (input.titp2Care && !input.careJapaneseTest ? "exempt" : "met") : "not_met",
      rule: "JFT-Basic or JLPT N4+, plus the Care Japanese Language Evaluation Test (介護日本語評価試験). Technical Intern Training (ii) waives the general test; only TITP (ii) in nursing care also waives the care test.",
      you: careMet ? "Both language conditions met." : !(met || exempt) ? "Needs JLPT N4 / JFT-Basic and the care Japanese test." : "General test met; still needs the Care Japanese Language Evaluation Test.",
      source: S.care,
    });
  }

  // 5. SSW (ii) food service and fishery: B1 from 2027-04-01
  {
    const b1 = c.minCefr != null && CEFR_RANK[c.minCefr] >= 3;
    const maybe = level === "n3" && score == null;
    const inForce = applyDate >= SSW2_B1_FROM;
    items.push({
      id: "ssw2_food_fishery",
      name: "Specified Skilled Worker (ii): food service and fishery",
      nameJa: "特定技能2号 外食業・漁業（日本語能力）",
      kind: "requirement",
      status: !inForce ? "check_rules" : b1 ? "met" : maybe ? "considered_unclear" : "not_met",
      rule: "ISA's field pages say B1-level Japanese (日本語教育の参照枠) is required from 2027-04-01 and that how it is proved will be announced separately. Before that date, check the field's operating rules (運用要領); older rules asked for JLPT N3.",
      you: !inForce
        ? `Your apply date ${applyDate} is before 2027-04-01: check the current 運用要領. ${b1 ? "Your JLPT result is already B1 or higher on JLPT's CEFR reference." : ""}`.trim()
        : b1
          ? `Your JLPT result is ${c.minCefr} or higher on JLPT's CEFR reference; ISA has not yet said which proofs it accepts.`
          : maybe
            ? "An N3 pass is A2 or B1 on JLPT's reference (B1 from 104/180). Enter your score."
            : "Below B1 on JLPT's reference. N3 with 104+ points, or N2, shows B1.",
      inForceFrom: SSW2_B1_FROM,
      source: S.food,
    });
  }

  // 6. Employment for Skill Development (育成就労) from 2027-04-01
  {
    const a1 = atLeast(level, "n5") || !!input.jftBasic;
    const a2 = atLeast(level, "n4") || !!input.jftBasic;
    items.push({
      id: "ikusei_shuro",
      name: "Employment for Skill Development (replaces Technical Intern Training)",
      nameJa: "育成就労（2027年4月1日〜）",
      kind: "requirement",
      status: applyDate < IKUSEI_FROM ? "not_in_force_yet" : a1 ? "met" : "not_met",
      rule: "Starts 2027-04-01. Before starting work: pass an A1-level Japanese test (for example JLPT N5) or take an equivalent A1 course. By the end of the 3 years: an A2-target course. Moving to SSW (i) needs A2 (JLPT N4 level); changing employer by choice needs A2.1+ in most fields (A2.2 in nursing care).",
      you: a2 ? "A1 entry level met; your result also reaches A2 (N4 level) for the move to SSW (i)." : a1 ? "A1 entry level met (N5). N4 is the level for moving to SSW (i)." : "No A1 test pass entered; the employer must arrange an A1 course instead.",
      inForceFrom: IKUSEI_FROM,
      source: S.ikusei,
    });
  }

  // 7. Permanent residence B1 (considered from 2027-04-01)
  {
    const exemptReason = input.hsp ? "HSP holders and their families" : input.japaneseSchooling6y ? "6+ years of Japanese primary/secondary schooling" : null;
    const b1 = c.minCefr != null && CEFR_RANK[c.minCefr] >= 3;
    const maybe = level === "n3" && score == null;
    let status: Status;
    let you: string;
    if (applyDate < PR_B1_FROM) {
      status = "not_in_force_yet";
      you = `Applications before 2027-04-01 (yours: ${applyDate}) use the older guideline without the B1 factor.`;
    } else if (exemptReason) {
      status = "not_considered";
      you = `Not considered for you (${exemptReason}).`;
    } else if (b1) {
      status = "considered_met";
      you = `Your JLPT result is ${c.minCefr}+ on JLPT's CEFR reference. The guideline names no test, so keep the score report.`;
    } else if (maybe) {
      status = "considered_unclear";
      you = "An N3 pass is A2 or B1 on JLPT's reference (B1 from 104/180). Enter your score.";
    } else {
      status = "considered_not_met";
      you = "Below B1 on JLPT's reference. It is a factor ISA weighs, not an automatic refusal.";
    }
    items.push({
      id: "permanent_residence",
      name: "Permanent residence: B1 Japanese is a factor",
      nameJa: "永住許可（B1相当の日本語能力・考慮要素）",
      kind: "considered",
      status,
      rule: "For PR applications from 2027-04-01, ISA considers whether you have B1-level Japanese (日本語教育の参照枠). Not considered for HSP holders and families, people with 6+ years of Japanese primary/secondary schooling, and some children of permanent residents. No specific test is named.",
      you,
      inForceFrom: PR_B1_FROM,
      source: S.pr,
    });
  }

  // 8. Student: Japanese language schools / higher education
  items.push({
    id: "japanese_language_school",
    name: "Admission to a Japanese language school (Student visa)",
    nameJa: "日本語教育機関への入学（留学）",
    kind: "benchmark",
    status: atLeast(level, "n5") ? "met" : "not_met",
    rule: "JLPT N5 or higher satisfies the Japanese requirement for schools that may enrol Student-visa holders (other proofs exist, such as hours of study).",
    you: atLeast(level, "n5") ? `Met (JLPT ${L}).` : "No JLPT pass entered; schools accept other proofs too.",
    source: S.jlpt,
  });
  items.push({
    id: "higher_education",
    name: "Japanese universities and colleges (benchmark)",
    nameJa: "日本の高等教育機関への入学（目安）",
    kind: "benchmark",
    status: atLeast(level, "n2") ? "met" : "not_met",
    rule: "JLPT N2 or higher is the usual benchmark for admission to Japanese higher-education institutions; each school sets its own rules (many use the EJU).",
    you: atLeast(level, "n2") ? `Meets the N2 benchmark (JLPT ${L}).` : "Below the N2 benchmark.",
    source: S.jlpt,
  });

  // 9. Engineer / Humanities / International Services
  items.push({
    id: "engineer_humanities",
    name: "Engineer / Specialist in Humanities / International Services",
    nameJa: "技術・人文知識・国際業務",
    kind: "benchmark",
    status: atLeast(level, "n2") ? "met" : "not_required",
    rule: "No fixed Japanese level in the criteria. If your job uses Japanese and you must prove it, JLPT N2+ meets it.",
    you: atLeast(level, "n2") ? "N2+ covers jobs that use Japanese." : "Not required in general; needed only if the job itself uses Japanese.",
    source: S.jlpt,
  });

  // 10. National exams (medical etc.)
  items.push({
    id: "medical_national_exams",
    name: "Japanese national exams for overseas-licensed doctors, nurses, pharmacists etc.",
    nameJa: "医師等の国家試験受験資格（外国の免許・学校）",
    kind: "exam_eligibility",
    status: atLeast(level, "n1") ? "met" : "not_met",
    rule: "JLPT N1 is required to take Japan's national exams for medical practitioners licensed overseas, and for dentists, nurses, pharmacists, midwives, physical / occupational therapists, veterinarians and other listed professions. Prefectural assistant-nurse exams also need N1.",
    you: atLeast(level, "n1") ? "N1 requirement met (other eligibility checks apply)." : "Needs JLPT N1.",
    source: S.jlpt,
  });
  items.push({
    id: "junior_high_equivalency",
    name: "Junior high school equivalency exam: Japanese subject waived",
    nameJa: "中学校卒業程度認定試験（国語免除）",
    kind: "exam_eligibility",
    status: atLeast(level, "n2") ? "met" : "not_met",
    rule: "Foreign examinees with JLPT N1 or N2 are excused from the Japanese-language subject.",
    you: atLeast(level, "n2") ? "Japanese subject waived." : "Needs N2 or N1 for the waiver.",
    source: S.jlpt,
  });

  // 11. EPA nurse / care-worker candidates
  {
    const parts = [
      { c: "Philippines", min: "n5" as const },
      { c: "Indonesia", min: "n4" as const },
      { c: "Vietnam", min: "n3" as const },
    ];
    const ok = parts.filter((p) => atLeast(level, p.min)).map((p) => p.c);
    items.push({
      id: "epa_candidates",
      name: "EPA nurse / care-worker candidates (Philippines, Indonesia, Vietnam)",
      nameJa: "EPA看護師・介護福祉士候補者",
      kind: "requirement",
      status: ok.length === 3 ? "met" : ok.length ? "check_rules" : "not_met",
      rule: "Under the EPAs: Philippines about N5+, Indonesia about N4+, Vietnam N3+ (MHLW sets the details).",
      you: ok.length ? `Your level meets the line for: ${ok.join(", ")}.` : "Below every EPA line.",
      source: S.jlpt,
    });
  }

  const metCount = items.filter((i) => i.status === "met" || i.status === "considered_met").length;
  const hspPts = items[0].points ?? 0;
  const cefrTop = c.cefr ?? c.minCefr;
  const verdict: Verdict = !cefrTop ? "none" : CEFR_RANK[cefrTop] >= 4 ? "b2_plus" : CEFR_RANK[cefrTop] === 3 ? "b1" : CEFR_RANK[cefrTop] === 2 ? "a2" : "a1";

  const nextUp: string[] = [];
  if (!atLeast(level, "n5")) nextUp.push("N5: A1 entry level for 育成就労 and the usual Japanese-school line.");
  if (!atLeast(level, "n4")) nextUp.push("N4: Specified Skilled Worker (i) Japanese requirement (or JFT-Basic).");
  if (!atLeast(level, "n3") || (level === "n3" && (score == null || score < 104))) nextUp.push("N3 with 104+/180 (or N2): B1 on JLPT's CEFR reference, the level ISA will weigh for PR and require for SSW (ii) food service / fishery from 2027-04-01.");
  if (!atLeast(level, "n2")) nextUp.push("N2: 10 HSP points, Business Manager B2 rule, university benchmark.");
  if (!atLeast(level, "n1")) nextUp.push("N1: 15 HSP points, Designated Activities 46 (with a Japanese degree), national medical exams.");

  const label = level === "none" ? (bjt != null ? `BJT ${bjt}` : "No JLPT pass") : `JLPT ${L}${score != null ? ` (${score}/180)` : ""}`;
  const summary =
    `${label}: meets ${metCount} of ${items.length} Japanese-language rules checked` +
    (hspPts ? `, ${hspPts} HSP points` : "") +
    (cefrTop ? `, ${c.cefr ? "" : "at least "}${cefrTop} on JLPT's CEFR reference.` : ".");

  return {
    rulesAsOf: RULES_AS_OF,
    today,
    applyDate,
    level,
    score,
    bjtScore: bjt,
    verdict,
    summary,
    cefr: { level: c.cefr, atLeast: c.minCefr, note: c.note, source: S.cefr },
    hspPoints: hspPts,
    metCount,
    items,
    nextLevelUnlocks: nextUp,
    warnings,
    sources: [...SOURCES],
  };
}

export const RULES = {
  passMarks: Object.fromEntries(Object.entries(LEVEL_INFO).map(([k, v]) => [k, v.passMark])),
  cefrReference: LEVEL_INFO,
  cefrReferenceNote: "JLPT's official reference display (from the December 2025 exam): shown only for passes; covers language knowledge, reading and listening, not speaking or writing.",
  hspPoints: { n1_or_bjt480_or_japanese_major_abroad: 15, n2_or_bjt400: 10, n2NotWithJapaneseDegree: true },
  designatedActivities46: "Japanese university/graduate-school degree (or listed equivalents) + JLPT N1 or BJT 480+ (Japanese major abroad also proves the language).",
  businessManager: { from: BM_FROM, transitionalRenewalsUntil: BM_TRANSITION_END, b2Proofs: ["JLPT N2+", "BJT 400+", "20+ years as a mid/long-term resident", "Japanese higher-education graduate (専門学校 counts)", "Japanese compulsory school + high school"], who: "applicant or any full-time employee (Japanese nationals count)" },
  ssw1: { japanese: "JFT-Basic A2.2 or JLPT N4+", exemption: "TITP (ii) completed in good standing, any job type", care: "plus Care Japanese Language Evaluation Test (waived only by TITP (ii) in nursing care)" },
  ssw2FoodFishery: { b1From: SSW2_B1_FROM, note: "Proof method to be announced by ISA." },
  ikuseiShuro: { from: IKUSEI_FROM, entry: "A1 test pass (e.g. JLPT N5) or A1 course before starting work", end: "A2-target course within 3 years", toSsw1: "A2 (JLPT N4 level)", transfer: "A2.1+ in most fields, A2.2 in nursing care" },
  permanentResidence: { b1ConsideredFrom: PR_B1_FROM, notConsideredFor: ["HSP holders and families", "6+ years of Japanese primary/secondary schooling", "some children of permanent residents born in Japan"], testNamed: false },
  benchmarks: { japaneseLanguageSchool: "N5+", higherEducation: "N2+", engineerHumanitiesWhenJobUsesJapanese: "N2+", medicalNationalExams: "N1", assistantNurseExam: "N1", juniorHighEquivalencyJapaneseWaived: "N1 or N2", epa: { philippines: "about N5+", indonesia: "about N4+", vietnam: "N3+" } },
};
