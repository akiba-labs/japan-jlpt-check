import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { InputError } from "./agent-api";
import { EXAMPLE_GET, computeCheck, parseLevel } from "./api";

describe("computeCheck", () => {
  it("example get works", () => {
    const q = Object.fromEntries(new URL(`https://x.example${EXAMPLE_GET}`).searchParams);
    const r = computeCheck({ ...q, today: "2026-11-09" });
    assert.equal(r.hspPoints, 10);
    assert.equal(r.cefr.level, "B2");
    assert.ok(r.sources.length >= 8);
  });
  it("accepts level aliases", () => {
    for (const v of ["N2", "2", "JLPT N2", "日本語能力試験N2", "ｎ２", "n2 level"]) assert.equal(parseLevel(v), "n2");
    assert.equal(parseLevel("なし"), "none");
    const r = computeCheck({ jlpt: "N1", japanDegree: "yes", bjt: "", today: "2026-11-09" });
    assert.equal(r.hspPoints, 15);
  });
  it("empty input works (no pass)", () => {
    assert.equal(computeCheck({ today: "2026-11-09" }).verdict, "none");
  });
  it("bad level → InputError", () => {
    assert.throws(() => computeCheck({ level: "n6" }), InputError);
  });
  it("bad score / bool → InputError", () => {
    assert.throws(() => computeCheck({ level: "n2", score: "abc" }), InputError);
    assert.throws(() => computeCheck({ level: "n2", score: "200" }), InputError);
    assert.throws(() => computeCheck({ level: "n2", hsp: "maybe" }), InputError);
  });
});
