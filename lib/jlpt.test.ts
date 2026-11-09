import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { RuleInputError, cefrFor, checkJlpt } from "./jlpt";

const T = "2026-11-09";
const item = (r: ReturnType<typeof checkJlpt>, id: string) => r.items.find((i) => i.id === id)!;

describe("cefrFor (JLPT official reference)", () => {
  it("maps score bands", () => {
    assert.equal(cefrFor("n1", 142).cefr, "C1");
    assert.equal(cefrFor("n1", 141).cefr, "B2");
    assert.equal(cefrFor("n2", 112).cefr, "B2");
    assert.equal(cefrFor("n2", 111).cefr, "B1");
    assert.equal(cefrFor("n3", 104).cefr, "B1");
    assert.equal(cefrFor("n3", 103).cefr, "A2");
    assert.equal(cefrFor("n4", 90).cefr, "A2");
    assert.equal(cefrFor("n5", 80).cefr, "A1");
  });
  it("below pass mark is no pass", () => {
    assert.equal(cefrFor("n3", 94).passed, false);
    assert.equal(cefrFor("n1", 99).cefr, null);
  });
  it("no score gives the lower bound", () => {
    const c = cefrFor("n3", null);
    assert.equal(c.cefr, null);
    assert.equal(c.minCefr, "A2");
    assert.equal(cefrFor("n4", null).cefr, "A2");
  });
});

describe("checkJlpt", () => {
  it("N2: 10 HSP points, BM met, 46 not met", () => {
    const r = checkJlpt({ level: "n2", score: 115, today: T });
    assert.equal(r.hspPoints, 10);
    assert.equal(item(r, "business_manager").status, "met");
    assert.equal(item(r, "designated_activities_46").status, "not_met");
    assert.equal(item(r, "ssw1").status, "met");
    assert.equal(r.cefr.level, "B2");
    assert.equal(r.verdict, "b2_plus");
    assert.equal(item(r, "permanent_residence").status, "not_in_force_yet");
  });
  it("N2 + Japanese degree: no extra N2 points", () => {
    const r = checkJlpt({ level: "n2", japaneseDegree: true, today: T });
    assert.equal(r.hspPoints, 0);
  });
  it("N1 + Japanese degree: 15 points and 46 met", () => {
    const r = checkJlpt({ level: "n1", japaneseDegree: true, today: T });
    assert.equal(r.hspPoints, 15);
    assert.equal(item(r, "designated_activities_46").status, "met");
    assert.equal(item(r, "medical_national_exams").status, "met");
  });
  it("BJT 480 counts as N1 for HSP / 46", () => {
    const r = checkJlpt({ bjtScore: 480, japaneseDegree: true, today: T });
    assert.equal(r.hspPoints, 15);
    assert.equal(item(r, "designated_activities_46").status, "met");
    assert.equal(item(r, "business_manager").status, "met");
  });
  it("PR from 2027-04-01: N3 104 met, N3 no score unclear, N4 not met, HSP not considered", () => {
    const a = "2027-04-01";
    assert.equal(item(checkJlpt({ level: "n3", score: 104, applyDate: a, today: T }), "permanent_residence").status, "considered_met");
    assert.equal(item(checkJlpt({ level: "n3", applyDate: a, today: T }), "permanent_residence").status, "considered_unclear");
    assert.equal(item(checkJlpt({ level: "n4", applyDate: a, today: T }), "permanent_residence").status, "considered_not_met");
    assert.equal(item(checkJlpt({ level: "n4", hsp: true, applyDate: a, today: T }), "permanent_residence").status, "not_considered");
    assert.equal(item(checkJlpt({ level: "n3", score: 100, applyDate: "2027-03-31", today: T }), "permanent_residence").status, "not_in_force_yet");
  });
  it("SSW1: TITP2 exemption and care test", () => {
    const r = checkJlpt({ level: "none", titp2: true, today: T });
    assert.equal(item(r, "ssw1").status, "exempt");
    assert.equal(item(r, "ssw1_care").status, "not_met");
    const c = checkJlpt({ level: "n4", careJapaneseTest: true, today: T });
    assert.equal(item(c, "ssw1_care").status, "met");
  });
  it("BM met by 20 years or Japanese 専門学校", () => {
    assert.equal(item(checkJlpt({ level: "n4", yearsInJapan: 20, today: T }), "business_manager").status, "met");
    assert.equal(item(checkJlpt({ level: "none", japaneseHigherEd: true, today: T }), "business_manager").status, "met");
    assert.equal(item(checkJlpt({ level: "n3", yearsInJapan: 19, today: T }), "business_manager").status, "not_met");
  });
  it("failed score treated as no pass", () => {
    const r = checkJlpt({ level: "n2", score: 80, today: T });
    assert.equal(r.level, "none");
    assert.equal(r.hspPoints, 0);
    assert.ok(r.warnings.length);
  });
  it("育成就労 from 2027-04-01", () => {
    assert.equal(item(checkJlpt({ level: "n5", applyDate: "2027-04-01", today: T }), "ikusei_shuro").status, "met");
    assert.equal(item(checkJlpt({ level: "n5", today: T }), "ikusei_shuro").status, "not_in_force_yet");
  });
  it("bad input throws", () => {
    assert.throws(() => checkJlpt({ level: "n6" as never }), RuleInputError);
    assert.throws(() => checkJlpt({ level: "n2", score: 181 }), RuleInputError);
    assert.throws(() => checkJlpt({ score: 100 }), RuleInputError);
    assert.throws(() => checkJlpt({ today: "2026-02-30" }), RuleInputError);
  });
});
