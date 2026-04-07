import { sanitizePaginationForExport, sanitizeResumeForExport } from "../services/exportSanitizer.js";
import { generatePdf } from "../services/pdfService.js";
import { renderResumeDocumentOnServer } from "../services/templateRenderService.js";
import { createHttpError } from "../utils/http.js";

function sanitizePdfFileName(value = "curriculo-online.pdf") {
  const sanitized = String(value ?? "curriculo-online.pdf")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_.]+|[-_.]+$/g, "")
    .toLowerCase();

  const normalized = sanitized || "curriculo-online";
  return normalized.endsWith(".pdf") ? normalized : `${normalized}.pdf`;
}

export async function exportPdfHandler(request, response, next) {
  try {
    if (!request.body?.resume || typeof request.body.resume !== "object") {
      throw createHttpError("Envie os dados do curriculo para gerar o PDF.", 400);
    }

    const resume = sanitizeResumeForExport(request.body.resume);
    const pagination = sanitizePaginationForExport(request.body.pagination);
    const html = await renderResumeDocumentOnServer(resume, { pagination });
    const pdfBuffer = await generatePdf({ html });
    const fileName = sanitizePdfFileName(request.body.fileName);
    const disposition = request.body.disposition === "inline" ? "inline" : "attachment";
    const output = Buffer.from(pdfBuffer);

    response.setHeader("Content-Type", "application/pdf");
    response.setHeader("Content-Disposition", `${disposition}; filename="${fileName}"`);
    response.setHeader("Content-Length", String(output.length));
    response.send(output);
  } catch (error) {
    next(error);
  }
}
