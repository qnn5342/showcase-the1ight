import assert from "node:assert/strict";
import test from "node:test";

import { getSeasonPath, getCohortLabel } from "./format.ts";

test("getSeasonPath builds a stable public deep link from cohort slug", () => {
  assert.equal(getSeasonPath("batch-3"), "/seasons/batch-3");
});

test("getCohortLabel falls back to the cohort name when class code is missing", () => {
  assert.equal(
    getCohortLabel({ name: "Batch 3", class_code: null }),
    "Batch 3"
  );
});

test("getCohortLabel prefixes class code when it exists", () => {
  assert.equal(
    getCohortLabel({ name: "Batch 3", class_code: "PB101" }),
    "PB101 - Batch 3"
  );
});
