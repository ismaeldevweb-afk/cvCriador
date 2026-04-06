export const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export class ApiError extends Error {
  constructor(message, { status, data, path } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status ?? 500;
    this.data = data ?? null;
    this.path = path ?? "";
  }
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

  return {
    data: null,
    message: (await response.text().catch(() => "")) || "Falha na comunicacao com a API.",
  };
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers ?? {});

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers,
  });

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
