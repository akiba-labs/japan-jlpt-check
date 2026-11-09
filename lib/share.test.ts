import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EXAMPLES, EXAMPLE_N1_GRAD, EXAMPLE_SHARED, parseShared, resultPath, safeCheck, sharedQuery } from "./share";

describe("share", () => {
  it("round-trips examples", () => {
    for (const e of EXAMPLES) {
      assert.deepEqual(parseShared(new URLSearchParams(sharedQuery(e))), e);
      assert.ok(safeCheck(e));
    }
    assert.ok(resultPath(EXAMPLE_SHARED).startsWith("/r?l=n2"));
  });
  it("encodes flags", () => {
    assert.ok(sharedQuery(EXAMPLE_N1_GRAD).includes("jd=1"));
  });
  it("rejects bad level", () => {
    assert.equal(parseShared(new URLSearchParams("l=n9")), null);
  });
});
