import "dotenv/config";

const DEFAULT_PORT = 4000;
const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];
const DEFAULT_ALLOWED_PDF_IMAGE_HOSTS = ["*.githubusercontent.com", "*.licdn.com"];

export function normalizeOrigin(value = "") {
  return String(value ?? "").trim().replace(/\/+$/g, "");
}

function splitCsv(value, fallback = []) {
  if (typeof value !== "string" || !value.trim()) {
    return [...fallback];
  }

  return value.split(",").map((entry) => entry.trim()).filter(Boolean);
}

function parsePort(value) {
  const parsed = Number.parseInt(String(value ?? DEFAULT_PORT), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_PORT;
}

function createNormalizedList(value, fallback) {
  return Array.from(new Set(splitCsv(value, fallback).map(normalizeOrigin).filter(Boolean)));
}

export function getRuntimeConfig(env = process.env) {
  const nodeEnv = String(env.NODE_ENV ?? "development").trim().toLowerCase();
  const allowedOrigins = createNormalizedList(env.ALLOWED_ORIGINS, DEFAULT_ALLOWED_ORIGINS);
  const allowedPdfImageHosts = createNormalizedList(
    env.ALLOWED_PDF_IMAGE_HOSTS,
    DEFAULT_ALLOWED_PDF_IMAGE_HOSTS,
  );

  if (nodeEnv === "production" && !String(env.ALLOWED_ORIGINS ?? "").trim()) {
    throw new Error("ALLOWED_ORIGINS must be configured in production.");
  }

  return {
    nodeEnv,
    port: parsePort(env.PORT),
    allowedOrigins,
    disablePuppeteerSandbox: env.PUPPETEER_DISABLE_SANDBOX === "1",
    allowedPdfImageHosts,
  };
}

export const runtimeConfig = getRuntimeConfig();
