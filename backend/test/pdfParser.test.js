import test from "node:test";
import assert from "node:assert/strict";
import { parseProfilePdf } from "../services/import/pdfParser.js";

function createMinimalPdfBase64() {
  const pdf = [
    "%PDF-1.4",
    "1 0 obj",
    "<< /Type /Catalog /Pages 2 0 R >>",
    "endobj",
    "2 0 obj",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "endobj",
    "3 0 obj",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    "endobj",
    "4 0 obj",
    "<< /Length 63 >>",
    "stream",
    "BT",
    "/F1 24 Tf",
    "72 100 Td",
    "(John Doe) Tj",
    "0 -30 Td",
    "(Software Engineer) Tj",
    "ET",
    "endstream",
    "endobj",
    "5 0 obj",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "endobj",
    "trailer",
    "<< /Root 1 0 R >>",
    "%%EOF",
  ].join("\n");

  return Buffer.from(pdf, "latin1").toString("base64");
}

test("parseProfilePdf processes a minimal PDF inside the worker", async () => {
  const result = await parseProfilePdf({
    fileName: "sample.pdf",
    fileContentBase64: createMinimalPdfBase64(),
    sourceType: "resume_pdf",
  });

  assert.equal(result.source.label, "Curriculo em PDF");
  assert.ok(result.sections.length > 0);
  assert.match(result.meta.parser, /pdf-parse|heuristic-pdf-text/);
});

test("parseProfilePdf rejects unsupported source types", async () => {
  await assert.rejects(
    () =>
      parseProfilePdf({
        fileName: "sample.pdf",
        fileContentBase64: createMinimalPdfBase64(),
        sourceType: "github",
      }),
    (error) => error?.status === 400 && /tipo de importacao de pdf nao suportado/i.test(error.message),
  );
});
