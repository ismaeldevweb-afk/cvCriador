import { ApiError, buildApiUrl } from "./apiClient";
import { activityInsights } from "./activityInsights";

export function createPdfFileName(fullName) {
  return `${(fullName || "curriculo-online")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "curriculo-online"}.pdf`;
}

export async function exportPdfFile({ resume, fileName, pagination }) {
  const response = await fetch(buildApiUrl("/export-pdf"), {
    method: "POST",
    headers: {
      Accept: "application/pdf",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      resume,
      fileName,
      disposition: "attachment",
      pagination,
    }),
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    const errorBody = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text().catch(() => "");

    throw new ApiError(
      errorBody?.message || errorBody || "Falha ao gerar o PDF.",
      { status: response.status, data: errorBody, path: "/export-pdf" },
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/pdf")) {
    const fallbackText = await response.text().catch(() => "");
    throw new Error(
      `A exportacao nao retornou um PDF valido. Resposta recebida: ${contentType || "desconhecida"}${fallbackText ? `.` : ""}`,
    );
  }

  const pdfBlob = await response.blob();
  if (!pdfBlob.size) {
    throw new Error("O servidor retornou um PDF vazio.");
  }

  const objectUrl = window.URL.createObjectURL(new Blob([pdfBlob], { type: "application/pdf" }));
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.rel = "noopener";
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  activityInsights.trackPdfExport({ fileName });

  window.setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl);
  }, 1000);
}
