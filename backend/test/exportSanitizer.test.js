import test from "node:test";
import assert from "node:assert/strict";
import { sanitizePaginationForExport } from "../services/exportSanitizer.js";

test("sanitizePaginationForExport normalizes page starts and keeps the first page at zero", () => {
  const result = sanitizePaginationForExport({
    pageStarts: [480.2, -5, "960", 0, 480.2, Number.NaN],
  });

  assert.deepEqual(result, {
    pageStarts: [0, 480, 960],
  });
});

test("sanitizePaginationForExport falls back to a single page when no valid data is provided", () => {
  const result = sanitizePaginationForExport({
    pageStarts: ["invalid", null],
  });

  assert.deepEqual(result, {
    pageStarts: [0],
  });
});
