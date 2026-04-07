function normalizeApiBase(value = "") {
  return String(value ?? "").trim().replace(/\/+$/g, "");
}

function isLocalApiBase(value = "") {
  return /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/|$)/i.test(value);
}

function isLocalRuntimeHost() {
  if (typeof window === "undefined") {
    return false;
  }

  return /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
}

function joinApiBase(base = "", path = "") {
  const normalizedBase = normalizeApiBase(base);
  const normalizedPath = `/${String(path ?? "").trim().replace(/^\/+/, "")}`;
  return `${normalizedBase}${normalizedPath}`;
}

function resolveApiBase() {
  const configuredApiBase = normalizeApiBase(import.meta.env.VITE_API_URL);
  const configuredProxyTarget = normalizeApiBase(import.meta.env.VITE_API_PROXY_TARGET);
  const isLocalRuntime = isLocalRuntimeHost();

  if (configuredApiBase) {
    if (import.meta.env.DEV && configuredApiBase.startsWith("/") && configuredProxyTarget) {
      return joinApiBase(configuredProxyTarget, configuredApiBase);
    }

    if (import.meta.env.PROD && isLocalApiBase(configuredApiBase) && !isLocalRuntime) {
      throw new Error("VITE_API_URL cannot point to localhost in production.");
    }

    return configuredApiBase;
  }

  if (import.meta.env.DEV || isLocalRuntime) {
    return "/api";
  }

  if (typeof window !== "undefined") {
    console.warn("VITE_API_URL is not configured. Falling back to same-origin /api.");
  }

  return "/api";
}

export const API_BASE = resolveApiBase();
const DEV_PROXY_TARGET = import.meta.env.DEV ? normalizeApiBase(import.meta.env.VITE_API_PROXY_TARGET) || "http://localhost:4000" : "";

export class ApiError extends Error {
  constructor(message, { status, data, path } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status ?? 500;
    this.data = data ?? null;
    this.path = path ?? "";
  }
}

function createLocalApiUnavailableMessage() {
  return `A API local nao respondeu. Inicie ou reinicie o backend em ${DEV_PROXY_TARGET} e tente novamente.`;
}

function isProxyFailureMessage(message = "") {
  return /ECONNREFUSED|socket hang up|proxy error|Error occurred while trying to proxy/i.test(String(message ?? ""));
}

export function buildApiUrl(path = "") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
}

async function parseError(response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const data = await response.json().catch(() => null);
    return {
      data,
      message: data?.message ?? "Falha na comunicacao com a API.",
    };
  }

  const text = (await response.text().catch(() => "")) || "Falha na comunicacao com a API.";

  if (import.meta.env.DEV && API_BASE === "/api" && response.status >= 500 && isProxyFailureMessage(text)) {
    return {
      data: null,
      message: createLocalApiUnavailableMessage(),
    };
  }

  return {
    data: null,
    message: text,
  };
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers ?? {});

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let response;

  try {
    response = await fetch(buildApiUrl(path), {
      ...options,
      headers,
    });
  } catch (error) {
    if (import.meta.env.DEV && API_BASE === "/api") {
      throw new ApiError(createLocalApiUnavailableMessage(), {
        status: 503,
        data: null,
        path,
      });
    }

    throw error;
  }

  if (!response.ok) {
    const { message, data } = await parseError(response);
    throw new ApiError(message, {
      status: response.status,
      data,
      path,
    });
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json") ? response.json() : response.blob();
}
