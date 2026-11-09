"use client";

import { useState, useSyncExternalStore } from "react";
import { CardDisclaimer } from "@/components/card-disclaimer";
import { ShareBar } from "@/components/share-bar";
import type { Level } from "@/lib/jlpt";
import { EXAMPLE_SHARED, FLAGS, PUBLIC_URL, resultPath, safeCheck, type Shared } from "@/lib/share";
import { STATUS_LABEL, STATUS_STYLE, VERDICT_LABEL, VERDICT_STYLE } from "@/lib/verdict";

const field = "mt-2 w-full rounded-xl border border-line bg-black/40 px-3 py-2 text-sm text-foreground focus:border-amber";
const noopSubscribe = () => () => {};

type Flag = (typeof FLAGS)[number][0];
const FLAG_LABEL: Record<Flag, string> = {
  japaneseDegree: "Degree from a Japanese university / graduate school",
  japaneseHigherEd: "Graduated from a Japanese 専門学校, 高専 or junior college",
  japaneseMajorAbroad: "Majored in Japanese at a university outside Japan",
  japaneseHighSchool: "Japanese compulsory school + Japanese high school",
  japaneseSchooling6y: "6+ years of primary / secondary school in Japan",
  jftBasic: "Passed JFT-Basic (A2)",
  titp2: "Completed Technical Intern Training (ii) 技能実習2号",
  titp2Care: "…and it was in nursing care (介護)",
  careJapaneseTest: "Passed the Care Japanese Language Evaluation Test",
  hsp: "I hold HSP status (or am an HSP family member)",
};

function numOrNull(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function Calculator({ initial }: { initial?: Shared }) {
  const start = initial ?? EXAMPLE_SHARED;
  const [level, setLevel] = useState<Level>(start.level);
  const [score, setScore] = useState(start.score != null ? String(start.score) : "");
  const [bjt, setBjt] = useState(start.bjtScore != null ? String(start.bjtScore) : "");
  const [years, setYears] = useState(start.yearsInJapan != null ? String(start.yearsInJapan) : "");
  const [flags, setFlags] = useState<Record<Flag, boolean>>(Object.fromEntries(FLAGS.map(([k]) => [k, start[k]])) as Record<Flag, boolean>);
  const [apply, setApply] = useState(start.applyDate ?? "");
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const today = initial || !hydrated ? start.today : null;

  const shared: Shared = {
    ...flags,
    level,
    score: level === "none" ? null : numOrNull(score),
    bjtScore: numOrNull(bjt),
    yearsInJapan: numOrNull(years),
    applyDate: apply || null,
    today,
  };
  const r = safeCheck(shared);
  const shareUrl = `${PUBLIC_URL}${resultPath(shared)}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.3fr]">
      <div className="rounded-3xl border border-line bg-panel/60 p-5 sm:p-6">
        <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">Your Japanese</p>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-foreground">Highest JLPT level passed</span>
          <select data-testid="level" className={field} value={level} onChange={(e) => setLevel(e.target.value as Level)}>
            <option value="n1">N1</option>
            <option value="n2">N2</option>
            <option value="n3">N3</option>
            <option value="n4">N4</option>
            <option value="n5">N5</option>
            <option value="none">None yet</option>
          </select>
        </label>
        {level !== "none" ? (
          <label className="mt-4 block">
            <span className="text-sm font-medium text-foreground">Total score (総合得点, optional, out of 180)</span>
            <input data-testid="score" inputMode="numeric" className={field} value={score} placeholder="e.g. 115" onChange={(e) => setScore(e.target.value)} />
          </label>
        ) : null}
        <label className="mt-4 block">
          <span className="text-sm font-medium text-foreground">BJT score (optional)</span>
          <input data-testid="bjt" inputMode="numeric" className={field} value={bjt} placeholder="e.g. 480" onChange={(e) => setBjt(e.target.value)} />
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-foreground">Years living in Japan (optional)</span>
          <input data-testid="years" inputMode="numeric" className={field} value={years} placeholder="e.g. 4" onChange={(e) => setYears(e.target.value)} />
        </label>
        <div className="mt-4 space-y-2">
          {FLAGS.map(([k]) => (
            <label key={k} className="flex items-start gap-2 text-sm text-foreground">
              <input data-testid={`flag-${k}`} type="checkbox" className="mt-1" checked={flags[k]} onChange={(e) => setFlags({ ...flags, [k]: e.target.checked })} />
              <span>{FLAG_LABEL[k]}</span>
            </label>
          ))}
        </div>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-muted">Planned application date (optional, default today)</span>
          <input data-testid="apply" type="date" className={field} value={apply} onChange={(e) => setApply(e.target.value)} />
        </label>
      </div>

      <div className="relative min-w-0 overflow-hidden rounded-3xl border border-line bg-panel/60">
        <div className="p-5 sm:p-7" data-testid="result">
          {r ? (
            <>
              <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">
                {VERDICT_LABEL[r.verdict]} · CEFR reference
              </p>
              <p className={`mt-2 font-display text-3xl leading-tight tracking-tight sm:text-4xl ${VERDICT_STYLE[r.verdict]}`}>{r.summary}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-line bg-black/30 p-4">
                  <p className="font-mono text-2xl text-foreground">{r.cefr.level ?? (r.cefr.atLeast ? `${r.cefr.atLeast}+` : "—")}</p>
                  <p className="text-xs text-muted">CEFR (JLPT reference)</p>
                </div>
                <div className="rounded-2xl border border-line bg-black/30 p-4">
                  <p className="font-mono text-2xl text-foreground">{r.hspPoints}</p>
                  <p className="text-xs text-muted">HSP language points</p>
                </div>
                <div className="rounded-2xl border border-line bg-black/30 p-4">
                  <p className="font-mono text-2xl text-foreground">
                    {r.metCount}/{r.items.length}
                  </p>
                  <p className="text-xs text-muted">rules met</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted">{r.cefr.note}</p>

              <ul className="mt-6 space-y-3">
                {r.items.map((i) => (
                  <li key={i.id} data-testid={`item-${i.id}`} className="rounded-2xl border border-line bg-black/20 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="min-w-0 text-sm font-semibold text-foreground">
                        {i.name} <span className="block text-xs font-normal text-muted">{i.nameJa}</span>
                      </p>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[11px] ${STATUS_STYLE[i.status]}`}>
                        {i.status === "points" ? `+${i.points}` : STATUS_LABEL[i.status]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-foreground/90">{i.you}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      {i.rule}{" "}
                      <a href={i.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                        source
                      </a>
                    </p>
                  </li>
                ))}
              </ul>

              {r.nextLevelUnlocks.length ? (
                <>
                  <h3 className="mt-6 text-sm font-semibold text-foreground">What the next level unlocks</h3>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
                    {r.nextLevelUnlocks.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {r.warnings.length ? (
                <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-amber-100">
                  {r.warnings.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-6">
                <ShareBar url={shareUrl} text={`My JLPT check: ${r.summary}`} />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">Check the numbers: JLPT total score is 0–180 and must be at least the pass mark; BJT is 0–800.</p>
          )}
        </div>
        <CardDisclaimer />
      </div>
    </div>
  );
}
