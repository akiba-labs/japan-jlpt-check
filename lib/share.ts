import { LEVELS, checkJlpt, type JlptInput, type Level } from "./jlpt";

export { PUBLIC_URL } from "./api";

type Params = URLSearchParams | Record<string, string | string[] | undefined>;
function one(p: Params, k: string): string | null {
  const v = p instanceof URLSearchParams ? p.get(k) : p[k];
  const f = Array.isArray(v) ? v[0] : v;
  return f === undefined || f === null || f === "" ? null : String(f);
}
const ISO = /^\d{4}-\d{2}-\d{2}$/;
function date(p: Params, k: string): string | null {
  const v = one(p, k);
  return v && ISO.test(v) ? v : null;
}
function num(p: Params, k: string): number | null {
  const v = one(p, k);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export const FLAGS = [
  ["japaneseDegree", "jd"],
  ["japaneseHigherEd", "he"],
  ["japaneseMajorAbroad", "jm"],
  ["japaneseHighSchool", "hs"],
  ["japaneseSchooling6y", "s6"],
  ["jftBasic", "jft"],
  ["titp2", "ti"],
  ["titp2Care", "tc"],
  ["careJapaneseTest", "ct"],
  ["hsp", "hsp"],
] as const;
type Flag = (typeof FLAGS)[number][0];

export type Shared = {
  level: Level;
  score: number | null;
  bjtScore: number | null;
  yearsInJapan: number | null;
  applyDate: string | null;
  today: string | null;
} & Record<Flag, boolean>;

const NO_FLAGS = Object.fromEntries(FLAGS.map(([k]) => [k, false])) as Record<Flag, boolean>;

export const EXAMPLE_SHARED: Shared = { ...NO_FLAGS, level: "n2", score: 115, bjtScore: null, yearsInJapan: null, applyDate: null, today: "2026-11-09" };
export const EXAMPLE_N3_PR: Shared = { ...EXAMPLE_SHARED, level: "n3", score: 104, applyDate: "2027-04-01" };
export const EXAMPLE_N1_GRAD: Shared = { ...EXAMPLE_SHARED, level: "n1", score: 150, japaneseDegree: true };
export const EXAMPLE_N4_SSW: Shared = { ...EXAMPLE_SHARED, level: "n4", score: 100 };
export const EXAMPLES = [EXAMPLE_SHARED, EXAMPLE_N3_PR, EXAMPLE_N1_GRAD, EXAMPLE_N4_SSW];

export function parseShared(p: Params): Shared | null {
  const l = one(p, "l");
  if (!l || !(LEVELS as readonly string[]).includes(l)) return null;
  const flags = Object.fromEntries(FLAGS.map(([k, q]) => [k, one(p, q) === "1"])) as Record<Flag, boolean>;
  return {
    ...flags,
    level: l as Level,
    score: num(p, "s"),
    bjtScore: num(p, "b"),
    yearsInJapan: num(p, "y"),
    applyDate: date(p, "a"),
    today: date(p, "t"),
  };
}

export function sharedQuery(s: Shared): string {
  const q = new URLSearchParams();
  q.set("l", s.level);
  if (s.score != null) q.set("s", String(s.score));
  if (s.bjtScore != null) q.set("b", String(s.bjtScore));
  if (s.yearsInJapan != null) q.set("y", String(s.yearsInJapan));
  for (const [k, key] of FLAGS) if (s[k]) q.set(key, "1");
  if (s.applyDate) q.set("a", s.applyDate);
  if (s.today) q.set("t", s.today);
  return q.toString();
}

export function toCheckInput(s: Shared): JlptInput {
  return { ...s };
}
export function safeCheck(s: Shared) {
  try {
    return checkJlpt(toCheckInput(s));
  } catch {
    return null;
  }
}
export function resultPath(s: Shared): string {
  return `/r?${sharedQuery(s)}`;
}
export function ogPath(s: Shared): string {
  return `/og?${sharedQuery(s)}`;
}
export function isIndexable(s: Shared): boolean {
  return EXAMPLES.some((e) => resultPath(e) === resultPath(s));
}
