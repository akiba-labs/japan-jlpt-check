import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { InputError, apiHandler } from "./agent-api";
import { API_DISCLAIMER, ENDPOINTS, EXAMPLE_GET, PUBLIC_URL, computeCheck, parseLevel } from "./api";

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

describe("POST body", () => {
  const e = ENDPOINTS.check;
  const handler = apiHandler(e.compute, { disclaimer: API_DISCLAIMER, docs: `${PUBLIC_URL}/openapi.json`, example: `${PUBLIC_URL}${e.example}` });
  it("non-object JSON body ([], string, number, null) → 400 with a clear error", async () => {
    for (const body of ["[]", '"x"', "1", "null"]) {
      const res = await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body }));
      assert.equal(res.status, 400, body);
      const j = await res.json();
      assert.match(j.error, /Body must be a JSON object/);
    }
  });
  it("JSON object body still works", async () => {
    const res = await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ level: "n2", today: "2026-11-09" }) }));
    assert.equal(res.status, 200);
  });
});
