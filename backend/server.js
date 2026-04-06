import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { runtimeConfig, normalizeOrigin } from "./config/runtimeConfig.js";
import aiRoutes from "./routes/aiRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import importRoutes from "./routes/importRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { createHttpError } from "./utils/http.js";

const currentFile = fileURLToPath(import.meta.url);
const allowedOrigins = new Set(runtimeConfig.allowedOrigins);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Muitas requisicoes para a API. Aguarde alguns minutos antes de tentar novamente.",
  },
});

const pdfLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Limite de exportacao em PDF atingido. Aguarde um minuto antes de gerar outro arquivo.",
  },
});

const importPdfLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Limite de importacao de PDF atingido. Aguarde alguns minutos antes de tentar novamente.",
  },
});

export const app = express();

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
        callback(null, true);
        return;
      }

      callback(createHttpError("Origem nao permitida para acessar esta API.", 403));
    },
    credentials: false,
  }),
);
app.use("/api", apiLimiter);
app.use("/api/export-pdf", pdfLimiter);
app.use("/api/import-profile/pdf", importPdfLimiter);

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    service: "criador-de-curriculo-online",
  });
});

app.use("/api/ai", aiRoutes);
app.use("/api/import-profile", importRoutes);
app.use("/api", exportRoutes);
app.use(errorHandler);

export async function startServer(port = runtimeConfig.port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`Resume Studio API running at http://localhost:${port}`);
      resolve(server);
    });

    server.requestTimeout = 30_000;
    server.headersTimeout = 35_000;
    server.keepAliveTimeout = 5_000;
    server.on("error", reject);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  startServer(runtimeConfig.port).catch((error) => {
    console.error("Failed to start Resume Studio API", error);
    process.exit(1);
  });
}
