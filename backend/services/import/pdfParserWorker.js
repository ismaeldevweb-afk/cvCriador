import { parentPort, workerData } from "node:worker_threads";
import { parseProfilePdfInProcess } from "./pdfParser.js";

function serializeWorkerError(error) {
  return {
    message: error?.message ?? "Falha ao processar o PDF enviado.",
    status: error?.status ?? 500,
  };
}

if (!parentPort) {
  throw new Error("Worker de PDF iniciado sem canal de comunicacao.");
}

try {
  const result = await parseProfilePdfInProcess(workerData);
  parentPort.postMessage({
    ok: true,
    result,
  });
} catch (error) {
  parentPort.postMessage({
    ok: false,
    error: serializeWorkerError(error),
  });
}
